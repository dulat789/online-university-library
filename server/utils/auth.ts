import jwt from "jsonwebtoken";
import { getCookie, createError } from "h3";
import type { H3Event } from "h3";

export interface JWTPayload {
  userId: number;
  email: string;
}

function getSecret(): string {
  return process.env.JWT_SECRET || "change-this-in-production";
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, getSecret()) as JWTPayload;
}

export function requireAuth(event: H3Event): JWTPayload {
  const token = getCookie(event, "auth_token");
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  try {
    return verifyToken(token);
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid or expired token",
    });
  }
}
