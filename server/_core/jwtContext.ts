import { TRPCError } from "@trpc/server";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { verifyAuthToken } from "../auth";
import { getUserByEmail } from "../db";
import type { User } from "../../drizzle/schema";

export async function createJWTContext(opts: CreateExpressContextOptions) {
  const { req, res } = opts;

  // Check for JWT token in Authorization header
  const authHeader = req.headers.authorization;
  let user: User | undefined = undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decoded = verifyAuthToken(token);

    if (decoded) {
      // Get user from database
      user = await getUserByEmail(decoded.email);
    }
  }

  return {
    req,
    res,
    user,
  };
}
