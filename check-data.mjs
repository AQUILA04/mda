import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const plans = await db.select().from(schema.cotisationPlans);
console.log("=== Cotisation Plans ===");
console.log(JSON.stringify(plans, null, 2));

const payments = await db.select().from(schema.cotisationPayments);
console.log("\n=== Cotisation Payments ===");
console.log(JSON.stringify(payments, null, 2));

const flux = await db.select().from(schema.fluxComptable);
console.log("\n=== Flux Comptable ===");
console.log(JSON.stringify(flux, null, 2));

process.exit(0);
