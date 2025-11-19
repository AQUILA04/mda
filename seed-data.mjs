import { drizzle } from "drizzle-orm/mysql2";
import { products, users } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seedData() {
  console.log("🌱 Seeding database...");

  try {
    // Seed products
    console.log("Adding products...");
    await db.insert(products).values([
      {
        nom: "iPhone 15 Pro",
        description: "Smartphone Apple dernière génération avec puce A17 Pro",
        prixClient: 850000,
        prixFournisseur: 700000,
        stockActuel: 10,
        category: "Électronique",
        imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
        isActive: 1,
      },
      {
        nom: "Samsung Galaxy S24",
        description: "Smartphone Samsung avec écran AMOLED 120Hz",
        prixClient: 650000,
        prixFournisseur: 550000,
        stockActuel: 15,
        category: "Électronique",
        imageUrl: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
        isActive: 1,
      },
      {
        nom: "MacBook Air M3",
        description: "Ordinateur portable Apple avec puce M3",
        prixClient: 1200000,
        prixFournisseur: 1000000,
        stockActuel: 5,
        category: "Informatique",
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
        isActive: 1,
      },
      {
        nom: "PlayStation 5",
        description: "Console de jeu Sony dernière génération",
        prixClient: 450000,
        prixFournisseur: 380000,
        stockActuel: 8,
        category: "Gaming",
        imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400",
        isActive: 1,
      },
      {
        nom: "AirPods Pro 2",
        description: "Écouteurs sans fil Apple avec réduction de bruit",
        prixClient: 180000,
        prixFournisseur: 150000,
        stockActuel: 20,
        category: "Audio",
        imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400",
        isActive: 1,
      },
      {
        nom: "Samsung 55\" QLED TV",
        description: "Téléviseur QLED 4K 55 pouces",
        prixClient: 550000,
        prixFournisseur: 450000,
        stockActuel: 6,
        category: "Électronique",
        imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400",
        isActive: 1,
      },
      {
        nom: "Canon EOS R6",
        description: "Appareil photo hybride professionnel",
        prixClient: 2200000,
        prixFournisseur: 1900000,
        stockActuel: 3,
        category: "Photo",
        imageUrl: "https://images.unsplash.com/photo-1606980707446-59e8e6f0e1d9?w=400",
        isActive: 1,
      },
      {
        nom: "iPad Pro 12.9\"",
        description: "Tablette Apple avec écran Liquid Retina XDR",
        prixClient: 950000,
        prixFournisseur: 800000,
        stockActuel: 7,
        category: "Tablettes",
        imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
        isActive: 1,
      },
    ]);

    console.log("✅ Products seeded successfully");
    console.log("\n📝 Test users will be created on first login:");
    console.log("   - Admin user: Set via OWNER_OPEN_ID env variable");
    console.log("   - Other users: Create via Manus OAuth login");
    console.log("\n🔑 To test different roles:");
    console.log("   1. Login with different Manus accounts");
    console.log("   2. Admin can change user roles in Admin Dashboard");
    console.log("\n✨ Seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

seedData()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
