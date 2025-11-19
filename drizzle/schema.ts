import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Nullable for email/password users. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Hashed password for email/password authentication. Null for OAuth users. */
  password: varchar("password", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["client", "admin", "finance", "logistique", "ambassadeur"]).default("client").notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  referredBy: int("referredBy"), // ID of the user who referred this user
  avoirBalance: int("avoirBalance").default(0).notNull(), // Credit balance in FCFA (stored as integer)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Products catalog
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  nom: varchar("nom", { length: 255 }).notNull(),
  description: text("description"),
  prixClient: int("prixClient").notNull(), // Price for client in FCFA
  prixFournisseur: int("prixFournisseur").notNull(), // Supplier price in FCFA
  stockActuel: int("stockActuel").default(0).notNull(),
  category: varchar("category", { length: 100 }),
  imageUrl: text("imageUrl"),
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Cotisation plans (Tontine)
export const cotisationPlans = mysqlTable("cotisationPlans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  montantTotal: int("montantTotal").notNull(), // Total amount in FCFA
  montantCotise: int("montantCotise").default(0).notNull(), // Amount paid so far
  frequence: varchar("frequence", { length: 50 }).notNull(), // daily, weekly, monthly
  montantParMise: int("montantParMise").notNull(), // Amount per payment
  statut: mysqlEnum("statut", ["actif", "complete", "liquide", "livre"]).default("actif").notNull(),
  dateDebut: timestamp("dateDebut").defaultNow().notNull(),
  dateFin: timestamp("dateFin"),
  prochaineEcheance: timestamp("prochaineEcheance"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Individual payments on cotisation plans
export const cotisationPayments = mysqlTable("cotisationPayments", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  montant: int("montant").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(), // MoMo, T-money, PayPal, etc.
  transactionRef: varchar("transactionRef", { length: 255 }),
  statut: mysqlEnum("statut", ["pending", "completed", "failed"]).default("completed").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// All financial transactions
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  montant: int("montant").notNull(), // Amount in FCFA
  type: varchar("type", { length: 50 }).notNull(), // cotisation, achat, commission, liquidation, etc.
  reference: varchar("reference", { length: 255 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Accounting flux classification
export const fluxComptable = mysqlTable("fluxComptable", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: int("transactionId").notNull(),
  typeFlux: mysqlEnum("typeFlux", [
    "vente_physique",
    "vente_digitale",
    "cotisation",
    "revenu_exceptionnel",
    "avoir_client",
    "commission",
    "salaire"
  ]).notNull(),
  montantNet: int("montantNet").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Commissions for ambassadors/referrals
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  ambassadeurId: int("ambassadeurId").notNull(),
  clientId: int("clientId").notNull(),
  planId: int("planId").notNull(),
  montant: int("montant").notNull(),
  statut: mysqlEnum("statut", ["pending", "paid"]).default("pending").notNull(),
  datePaiement: timestamp("datePaiement"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Deliveries tracking
export const deliveries = mysqlTable("deliveries", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  userId: int("userId").notNull(),
  productId: int("productId").notNull(),
  adresseLivraison: text("adresseLivraison").notNull(),
  statut: mysqlEnum("statut", ["en_attente", "en_cours", "livree", "annulee"]).default("en_attente").notNull(),
  dateValidation: timestamp("dateValidation"),
  dateLivraison: timestamp("dateLivraison"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});