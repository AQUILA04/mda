import { drizzle } from "drizzle-orm/mysql2";
import { users } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function createTestUsers() {
  console.log("👥 Creating test users for each role...");

  try {
    const testUsers = [
      {
        openId: "test-client-001",
        name: "Marie Dupont",
        email: "marie.dupont@test.mda.com",
        loginMethod: "test",
        role: "client",
        phone: "+228 90 12 34 56",
        address: "Lomé, Togo",
        avoirBalance: 0,
      },
      {
        openId: "test-client-002",
        name: "Jean Kouassi",
        email: "jean.kouassi@test.mda.com",
        loginMethod: "test",
        role: "client",
        phone: "+228 91 23 45 67",
        address: "Kara, Togo",
        avoirBalance: 15000,
      },
      {
        openId: "test-finance-001",
        name: "Fatou Diallo",
        email: "fatou.diallo@test.mda.com",
        loginMethod: "test",
        role: "finance",
        phone: "+228 92 34 56 78",
        address: "Lomé, Togo",
        avoirBalance: 0,
      },
      {
        openId: "test-logistique-001",
        name: "Kofi Mensah",
        email: "kofi.mensah@test.mda.com",
        loginMethod: "test",
        role: "logistique",
        phone: "+228 93 45 67 89",
        address: "Sokodé, Togo",
        avoirBalance: 0,
      },
      {
        openId: "test-ambassadeur-001",
        name: "Aminata Traoré",
        email: "aminata.traore@test.mda.com",
        loginMethod: "test",
        role: "ambassadeur",
        phone: "+228 94 56 78 90",
        address: "Lomé, Togo",
        avoirBalance: 0,
      },
    ];

    for (const user of testUsers) {
      await db.insert(users).values(user);
      console.log(`✅ Created: ${user.name} (${user.role})`);
    }

    console.log("\n✨ Test users created successfully!");
    console.log("\n🔑 Test Credentials:");
    console.log("═══════════════════════════════════════════════════════");
    console.log("\n📧 EMAIL                          | 👤 NOM              | 🎭 RÔLE");
    console.log("─────────────────────────────────────────────────────────");
    testUsers.forEach(user => {
      console.log(`${user.email.padEnd(33)} | ${user.name.padEnd(19)} | ${user.role}`);
    });
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("\n⚠️  NOTE: Ces utilisateurs sont créés directement dans la base");
    console.log("    Pour vous connecter avec ces comptes, vous devrez :");
    console.log("    1. Utiliser l'interface admin pour voir ces utilisateurs");
    console.log("    2. OU créer de vrais comptes Manus et changer leurs rôles via l'admin");
    console.log("\n💡 RECOMMANDATION:");
    console.log("    - Connectez-vous avec différents comptes Manus OAuth");
    console.log("    - L'admin peut ensuite changer les rôles dans l'interface");
    
  } catch (error) {
    console.error("❌ Error creating test users:", error);
    throw error;
  }
}

createTestUsers()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
