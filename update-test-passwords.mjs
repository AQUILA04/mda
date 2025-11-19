import { drizzle } from "drizzle-orm/mysql2";
import { users } from "./drizzle/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const db = drizzle(process.env.DATABASE_URL);

async function updateTestPasswords() {
  console.log("🔐 Updating test user passwords...");

  const testPassword = "password123"; // Default password for all test users
  const hashedPassword = await bcrypt.hash(testPassword, 10);

  try {
    const testEmails = [
      "marie.dupont@test.mda.com",
      "jean.kouassi@test.mda.com",
      "fatou.diallo@test.mda.com",
      "kofi.mensah@test.mda.com",
      "aminata.traore@test.mda.com",
    ];

    for (const email of testEmails) {
      await db.update(users)
        .set({ 
          password: hashedPassword,
          loginMethod: "email"
        })
        .where(eq(users.email, email));
      console.log(`✅ Updated password for: ${email}`);
    }

    console.log("\n✨ All test user passwords updated!");
    console.log("\n🔑 Test Credentials:");
    console.log("═══════════════════════════════════════════════════════");
    console.log("\n📧 EMAIL                          | 🔒 PASSWORD");
    console.log("─────────────────────────────────────────────────────────");
    testEmails.forEach(email => {
      console.log(`${email.padEnd(33)} | ${testPassword}`);
    });
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("\n💡 You can now login with these credentials!");
    
  } catch (error) {
    console.error("❌ Error updating passwords:", error);
    throw error;
  }
}

updateTestPasswords()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
