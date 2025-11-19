import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("JWT Authentication", () => {
  it("should register a new user with email/password", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.register({
      name: "Test User",
      email: `test${Date.now()}@example.com`,
      password: "testpassword123",
      phone: "+228 90 00 00 00",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("created successfully");
  });

  it("should login with email/password and return JWT token", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    // Use existing test user
    const result = await caller.auth.login({
      email: "marie.dupont@test.mda.com",
      password: "password123",
    });

    expect(result.token).toBeDefined();
    expect(result.token.length).toBeGreaterThan(0);
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe("marie.dupont@test.mda.com");
    expect(result.user.role).toBe("client");
  });

  it("should reject login with wrong password", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "marie.dupont@test.mda.com",
        password: "wrongpassword",
      })
    ).rejects.toThrow("Invalid email or password");
  });

  it("should reject login with non-existent email", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "nonexistent@example.com",
        password: "password123",
      })
    ).rejects.toThrow("Invalid email or password");
  });
});
