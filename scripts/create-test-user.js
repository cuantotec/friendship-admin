// Script to create a test user for eliran@cuantotec.com
import { db } from '../src/lib/db.js';
import { admins } from '../src/lib/schema.js';
import { eq } from 'drizzle-orm';

async function createTestUser() {
  try {
    console.log('🔧 Creating test user for eliran@cuantotec.com...');

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(admins)
      .where(eq(admins.email, 'eliran@cuantotec.com'))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('✅ Test user already exists');
      console.log('📧 Email:', existingUser[0].email);
      console.log('🔑 Role:', existingUser[0].role);
      return;
    }

    // Create test user
    await db.insert(admins).values({
      name: 'Eliran Test User',
      email: 'eliran@cuantotec.com',
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: eliran@cuantotec.com');
    console.log('🔑 Role: admin');
    console.log('💡 You can now test the OTP login system');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

// Run the script
createTestUser();
