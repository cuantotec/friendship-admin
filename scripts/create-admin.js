// Script to create an admin user for testing
import { db } from '../src/lib/db.js';
import { admins } from '../src/lib/schema.js';
import { eq } from 'drizzle-orm';

async function createAdmin() {
  try {
    console.log('🔧 Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.email, 'admin@friendshipgallery.com'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    await db.insert(admins).values({
      name: 'Gallery Administrator',
      email: 'admin@friendshipgallery.com',
      role: 'super_admin',
      isActive: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@friendshipgallery.com');
    console.log('🔑 Role: super_admin');
    console.log('💡 You can now test the OTP login system');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the script
createAdmin();
