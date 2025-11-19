import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId && !user.email) {
    throw new Error("User openId or email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId || null,
      email: user.email!,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    // Handle name separately
    if (user.name !== undefined) {
      const normalized = user.name ?? null;
      values.name = normalized;
      updateSet.name = normalized;
    }
    
    // Handle loginMethod
    if (user.loginMethod !== undefined) {
      const normalized = user.loginMethod ?? null;
      values.loginMethod = normalized;
      updateSet.loginMethod = normalized;
    }

    // textFields.forEach(assignNullable); // Already handled above

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Use email as unique identifier for upsert
    const existingUser = await db.select().from(users).where(eq(users.email, user.email!)).limit(1);
    
    if (existingUser.length > 0) {
      // Update existing user
      await db.update(users).set(updateSet).where(eq(users.email, user.email!));
    } else {
      // Insert new user
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// === Products ===
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  const { products } = await import("../drizzle/schema");
  return db.select().from(products).where(eq(products.isActive, 1));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { products } = await import("../drizzle/schema");
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function createProduct(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { products } = await import("../drizzle/schema");
  const result = await db.insert(products).values(data);
  return result;
}

export async function updateProduct(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { products } = await import("../drizzle/schema");
  await db.update(products).set(data).where(eq(products.id, id));
}

// === Cotisation Plans ===
export async function getUserCotisationPlans(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { cotisationPlans, products } = await import("../drizzle/schema");
  return db.select({
    plan: cotisationPlans,
    product: products
  }).from(cotisationPlans)
    .leftJoin(products, eq(cotisationPlans.productId, products.id))
    .where(eq(cotisationPlans.userId, userId));
}

export async function getCotisationPlanById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { cotisationPlans, products } = await import("../drizzle/schema");
  const result = await db.select({
    plan: cotisationPlans,
    product: products
  }).from(cotisationPlans)
    .leftJoin(products, eq(cotisationPlans.productId, products.id))
    .where(eq(cotisationPlans.id, id))
    .limit(1);
  return result[0];
}

export async function createCotisationPlan(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { cotisationPlans } = await import("../drizzle/schema");
  const result = await db.insert(cotisationPlans).values(data);
  return result;
}

export async function updateCotisationPlan(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { cotisationPlans } = await import("../drizzle/schema");
  await db.update(cotisationPlans).set(data).where(eq(cotisationPlans.id, id));
}

// === Cotisation Payments ===
export async function getPlanPayments(planId: number) {
  const db = await getDb();
  if (!db) return [];
  const { cotisationPayments } = await import("../drizzle/schema");
  return db.select().from(cotisationPayments).where(eq(cotisationPayments.planId, planId));
}

export async function createCotisationPayment(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { cotisationPayments } = await import("../drizzle/schema");
  const result = await db.insert(cotisationPayments).values(data);
  return result;
}

// === Transactions ===
export async function createTransaction(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { transactions } = await import("../drizzle/schema");
  const result = await db.insert(transactions).values(data);
  return result;
}

export async function getUserTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { transactions } = await import("../drizzle/schema");
  return db.select().from(transactions).where(eq(transactions.userId, userId));
}

// === Flux Comptable ===
export async function createFluxComptable(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { fluxComptable } = await import("../drizzle/schema");
  const result = await db.insert(fluxComptable).values(data);
  return result;
}

export async function getFluxComptableByType(typeFlux: string) {
  const db = await getDb();
  if (!db) return [];
  const { fluxComptable } = await import("../drizzle/schema");
  return db.select().from(fluxComptable).where(eq(fluxComptable.typeFlux, typeFlux as any));
}

export async function getAllFluxComptable() {
  const db = await getDb();
  if (!db) return [];
  const { fluxComptable } = await import("../drizzle/schema");
  return db.select().from(fluxComptable);
}

// === Deliveries ===
export async function createDelivery(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { deliveries } = await import("../drizzle/schema");
  const result = await db.insert(deliveries).values(data);
  return result;
}

export async function getDeliveriesByStatus(statut: string) {
  const db = await getDb();
  if (!db) return [];
  const { deliveries, users, products } = await import("../drizzle/schema");
  return db.select({
    delivery: deliveries,
    user: users,
    product: products
  }).from(deliveries)
    .leftJoin(users, eq(deliveries.userId, users.id))
    .leftJoin(products, eq(deliveries.productId, products.id))
    .where(eq(deliveries.statut, statut as any));
}

export async function getAllDeliveries() {
  const db = await getDb();
  if (!db) return [];
  const { deliveries, users, products } = await import("../drizzle/schema");
  return db.select({
    delivery: deliveries,
    user: users,
    product: products
  }).from(deliveries)
    .leftJoin(users, eq(deliveries.userId, users.id))
    .leftJoin(products, eq(deliveries.productId, products.id));
}

export async function updateDelivery(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { deliveries } = await import("../drizzle/schema");
  await db.update(deliveries).set(data).where(eq(deliveries.id, id));
}

// === Commissions ===
export async function createCommission(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { commissions } = await import("../drizzle/schema");
  const result = await db.insert(commissions).values(data);
  return result;
}

export async function getAmbassadeurCommissions(ambassadeurId: number) {
  const db = await getDb();
  if (!db) return [];
  const { commissions } = await import("../drizzle/schema");
  return db.select().from(commissions).where(eq(commissions.ambassadeurId, ambassadeurId));
}

export async function updateCommission(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { commissions } = await import("../drizzle/schema");
  await db.update(commissions).set(data).where(eq(commissions.id, id));
}

// === Users ===
export async function updateUserAvoir(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { users } = await import("../drizzle/schema");
  const user = await getUserByOpenId((await db.select().from(users).where(eq(users.id, userId)).limit(1))[0]?.openId || "");
  if (!user) throw new Error("User not found");
  const newBalance = (user.avoirBalance || 0) + amount;
  await db.update(users).set({ avoirBalance: newBalance }).where(eq(users.id, userId));
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  const { users } = await import("../drizzle/schema");
  return db.select().from(users);
}

export async function updateUserRole(userId: number, role: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { users } = await import("../drizzle/schema");
  await db.update(users).set({ role: role as any }).where(eq(users.id, userId));
}
