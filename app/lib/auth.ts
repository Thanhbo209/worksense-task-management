// lib/auth.ts
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface AuthUser {
  id: string;
  email?: string;
  role: "admin" | "user";
}

export async function auth(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);

    if (
      typeof payload.sub !== "string" ||
      (payload.role !== "admin" && payload.role !== "user")
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email as string | undefined,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
