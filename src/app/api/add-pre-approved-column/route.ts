import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log('Adding pre_approved column to artists table...');
    
    // Execute the SQL command directly
    await db.execute(`
      ALTER TABLE "artists" 
      ADD COLUMN IF NOT EXISTS "pre_approved" boolean DEFAULT false NOT NULL;
    `);
    
    console.log('✅ Successfully added pre_approved column to artists table');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully added pre_approved column to artists table' 
    });
  } catch (error) {
    console.error('❌ Error adding pre_approved column:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
