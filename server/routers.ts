import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { hashPassword, verifyPassword, generateAuthToken } from "./auth";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as db from "./db";

// Role-based procedure middleware
const clientProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx });
});

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const financeProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["admin", "finance"].includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Finance access required" });
  }
  return next({ ctx });
});

const logistiqueProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!["admin", "logistique"].includes(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Logistics access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        // Check if user exists
        const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (existing.length > 0) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await hashPassword(input.password);

        // Create user
        await db.insert(users).values({
          email: input.email,
          password: hashedPassword,
          name: input.name,
          phone: input.phone || null,
          loginMethod: "email",
          role: "client",
          openId: null,
        });

        return { success: true, message: "Account created successfully" };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

        // Find user
        const result = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (result.length === 0) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const user = result[0];
        
        // Check if user has password (email/password auth)
        if (!user.password) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This account uses OAuth login" });
        }

        // Verify password
        const valid = await verifyPassword(input.password, user.password);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        // Generate token
        const token = generateAuthToken(user.id, user.email);

        // Update last signed in
        await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));

        return {
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }),
    
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Products management
  products: router({
    list: publicProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    
    create: logistiqueProcedure
      .input(z.object({
        nom: z.string(),
        description: z.string().optional(),
        prixClient: z.number(),
        prixFournisseur: z.number(),
        stockActuel: z.number(),
        category: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProduct(input);
        return { success: true };
      }),
    
    update: logistiqueProcedure
      .input(z.object({
        id: z.number(),
        nom: z.string().optional(),
        description: z.string().optional(),
        prixClient: z.number().optional(),
        prixFournisseur: z.number().optional(),
        stockActuel: z.number().optional(),
        category: z.string().optional(),
        imageUrl: z.string().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
  }),

  // Cotisation plans
  cotisation: router({
    myPlans: clientProcedure.query(async ({ ctx }) => {
      return await db.getUserCotisationPlans(ctx.user.id);
    }),
    
    getPlan: clientProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const plan = await db.getCotisationPlanById(input.id);
        if (!plan || plan.plan.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return plan;
      }),
    
    create: clientProcedure
      .input(z.object({
        productId: z.number(),
        frequence: z.enum(["daily", "weekly", "monthly"]),
        montantParMise: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        
        // Calculate next payment date based on frequency
        const now = new Date();
        const prochaineEcheance = new Date(now);
        if (input.frequence === "daily") {
          prochaineEcheance.setDate(prochaineEcheance.getDate() + 1);
        } else if (input.frequence === "weekly") {
          prochaineEcheance.setDate(prochaineEcheance.getDate() + 7);
        } else {
          prochaineEcheance.setMonth(prochaineEcheance.getMonth() + 1);
        }
        
        await db.createCotisationPlan({
          userId: ctx.user.id,
          productId: input.productId,
          montantTotal: product.prixClient,
          montantCotise: 0,
          frequence: input.frequence,
          montantParMise: input.montantParMise,
          statut: "actif",
          prochaineEcheance,
        });
        
        return { success: true };
      }),
    
    makePayment: clientProcedure
      .input(z.object({
        planId: z.number(),
        montant: z.number(),
        paymentMethod: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const planData = await db.getCotisationPlanById(input.planId);
        if (!planData || planData.plan.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const plan = planData.plan;
        
        // Create payment record
        await db.createCotisationPayment({
          planId: input.planId,
          montant: input.montant,
          paymentMethod: input.paymentMethod,
          transactionRef: `TXN-${Date.now()}`,
          statut: "completed",
        });
        
        // Create transaction for this payment
        const paymentTransaction = await db.createTransaction({
          userId: ctx.user.id,
          montant: input.montant,
          type: "cotisation_payment",
          reference: `PAYMENT-${input.planId}-${Date.now()}`,
          description: `Paiement de ${input.montant} FCFA pour le plan ${input.planId}`,
        });
        
        // Create flux comptable for this payment (real-time tracking)
        await db.createFluxComptable({
          transactionId: paymentTransaction[0]?.insertId || 0,
          typeFlux: "vente_digitale",
          montantNet: input.montant,
        });
        
        // Update plan
        const newMontantCotise = plan.montantCotise + input.montant;
        const updates: any = {
          montantCotise: newMontantCotise,
        };
        
        // Check if plan is complete
        if (newMontantCotise >= plan.montantTotal) {
          updates.statut = "complete";
          updates.dateFin = new Date();
          
          // Create delivery
          await db.createDelivery({
            planId: input.planId,
            userId: ctx.user.id,
            productId: plan.productId,
            adresseLivraison: ctx.user.address || "À définir",
            statut: "en_attente",
          });
          
          // Create transaction
          await db.createTransaction({
            userId: ctx.user.id,
            montant: plan.montantTotal,
            type: "cotisation_complete",
            reference: `PLAN-${input.planId}`,
            description: "Cotisation complète - livraison déclenchée",
          });
          
          // Create flux comptable
          const transactionResult = await db.createTransaction({
            userId: ctx.user.id,
            montant: plan.montantTotal,
            type: "vente",
            reference: `PLAN-${input.planId}`,
          });
          
          await db.createFluxComptable({
            transactionId: transactionResult[0]?.insertId || 0,
            typeFlux: "vente_physique",
            montantNet: plan.montantTotal,
          });
        } else {
          // Update next payment date
          const prochaineEcheance = new Date(plan.prochaineEcheance || new Date());
          if (plan.frequence === "daily") {
            prochaineEcheance.setDate(prochaineEcheance.getDate() + 1);
          } else if (plan.frequence === "weekly") {
            prochaineEcheance.setDate(prochaineEcheance.getDate() + 7);
          } else {
            prochaineEcheance.setMonth(prochaineEcheance.getMonth() + 1);
          }
          updates.prochaineEcheance = prochaineEcheance;
        }
        
        await db.updateCotisationPlan(input.planId, updates);
        
        return { success: true, planComplete: newMontantCotise >= plan.montantTotal };
      }),
    
    requestLiquidation: clientProcedure
      .input(z.object({ planId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const planData = await db.getCotisationPlanById(input.planId);
        if (!planData || planData.plan.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        await db.updateCotisationPlan(input.planId, { statut: "liquide" });
        return { success: true };
      }),
    
    getPayments: clientProcedure
      .input(z.object({ planId: z.number() }))
      .query(async ({ input, ctx }) => {
        const planData = await db.getCotisationPlanById(input.planId);
        if (!planData || planData.plan.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        return await db.getPlanPayments(input.planId);
      }),
  }),

  // Finance operations
  finance: router({
    pendingLiquidations: financeProcedure.query(async () => {
      const allUsers = await db.getAllUsers();
      const liquidations = [];
      
      for (const user of allUsers) {
        const plans = await db.getUserCotisationPlans(user.id);
        const liquidePlans = plans.filter(p => p.plan.statut === "liquide");
        liquidations.push(...liquidePlans.map(p => ({ ...p, user })));
      }
      
      return liquidations;
    }),
    
    validateLiquidation: financeProcedure
      .input(z.object({ planId: z.number() }))
      .mutation(async ({ input }) => {
        const planData = await db.getCotisationPlanById(input.planId);
        if (!planData) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        const plan = planData.plan;
        const montantCotise = plan.montantCotise;
        
        // Calculate 1/3 for company, 2/3 for client avoir
        const penalite = Math.floor(montantCotise / 3);
        const avoirClient = montantCotise - penalite;
        
        // Create transaction for penalty (company revenue)
        const penaliteTransaction = await db.createTransaction({
          userId: plan.userId,
          montant: penalite,
          type: "liquidation_penalite",
          reference: `LIQ-${input.planId}`,
          description: "Pénalité de rupture de contrat (1/3)",
        });
        
        await db.createFluxComptable({
          transactionId: penaliteTransaction[0]?.insertId || 0,
          typeFlux: "revenu_exceptionnel",
          montantNet: penalite,
        });
        
        // Create transaction for client credit
        const avoirTransaction = await db.createTransaction({
          userId: plan.userId,
          montant: avoirClient,
          type: "liquidation_avoir",
          reference: `LIQ-${input.planId}`,
          description: "Avoir client suite à rupture (2/3)",
        });
        
        await db.createFluxComptable({
          transactionId: avoirTransaction[0]?.insertId || 0,
          typeFlux: "avoir_client",
          montantNet: avoirClient,
        });
        
        // Update user avoir balance
        await db.updateUserAvoir(plan.userId, avoirClient);
        
        // Mark plan as liquidated
        await db.updateCotisationPlan(input.planId, {
          statut: "liquide",
          dateFin: new Date(),
        });
        
        return {
          success: true,
          penalite,
          avoirClient,
        };
      }),
    
    revenueReport: financeProcedure.query(async () => {
      const allFlux = await db.getAllFluxComptable();
      
      const report = {
        ventesPhysiques: 0,
        ventesDigitales: 0,
        revenusExceptionnels: 0,
        commissions: 0,
        total: 0,
      };
      
      allFlux.forEach(flux => {
        if (flux.typeFlux === "vente_physique") report.ventesPhysiques += flux.montantNet;
        if (flux.typeFlux === "vente_digitale") report.ventesDigitales += flux.montantNet;
        if (flux.typeFlux === "revenu_exceptionnel") report.revenusExceptionnels += flux.montantNet;
        if (flux.typeFlux === "commission") report.commissions += flux.montantNet;
      });
      
      report.total = report.ventesPhysiques + report.ventesDigitales + report.revenusExceptionnels - report.commissions;
      
      return report;
    }),
  }),

  // Logistics operations
  logistics: router({
    pendingDeliveries: logistiqueProcedure.query(async () => {
      return await db.getDeliveriesByStatus("en_attente");
    }),
    
    allDeliveries: logistiqueProcedure.query(async () => {
      return await db.getAllDeliveries();
    }),
    
    validateDelivery: logistiqueProcedure
      .input(z.object({
        deliveryId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.updateDelivery(input.deliveryId, {
          statut: "en_cours",
          dateValidation: new Date(),
          notes: input.notes,
        });
        return { success: true };
      }),
    
    completeDelivery: logistiqueProcedure
      .input(z.object({ deliveryId: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateDelivery(input.deliveryId, {
          statut: "livree",
          dateLivraison: new Date(),
        });
        return { success: true };
      }),
  }),

  // Admin operations
  admin: router({
    allUsers: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),
    
    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["client", "admin", "finance", "logistique", "ambassadeur"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    
    coffreFort: adminProcedure.query(async () => {
      const allFlux = await db.getAllFluxComptable();
      const allTransactions = [];
      
      for (const flux of allFlux) {
        const transactions = await db.getUserTransactions(flux.transactionId);
        allTransactions.push(...transactions);
      }
      
      return {
        flux: allFlux,
        transactions: allTransactions,
      };
    }),
  }),

  // User profile
  profile: router({
    getAvoirBalance: clientProcedure.query(({ ctx }) => {
      return { balance: ctx.user.avoirBalance || 0 };
    }),
    
    getTransactions: clientProcedure.query(async ({ ctx }) => {
      return await db.getUserTransactions(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
