import { db } from "./db";
import { admins } from "./schema";
import { eq } from "drizzle-orm";

export async function seedAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.email, "admin@friendshipgallery.com"))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    await db.insert(admins).values({
      name: "Gallery Administrator",
      email: "admin@friendshipgallery.com",
      role: "super_admin",
      isActive: true,
    });

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Run if called directly
if (require.main === module) {
  seedAdmin();
}
