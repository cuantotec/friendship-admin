import { db } from '../src/lib/db.js';

async function addPreApprovedColumn() {
  try {
    console.log('Adding pre_approved column to artists table...');
    
    // Execute the SQL command directly
    await db.execute(`
      ALTER TABLE "artists" 
      ADD COLUMN IF NOT EXISTS "pre_approved" boolean DEFAULT false NOT NULL;
    `);
    
    console.log('✅ Successfully added pre_approved column to artists table');
  } catch (error) {
    console.error('❌ Error adding pre_approved column:', error);
  } finally {
    process.exit(0);
  }
}

addPreApprovedColumn();
