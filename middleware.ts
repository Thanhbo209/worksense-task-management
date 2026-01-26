// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const { pathname } = req.nextUrl;

  // No Login → Redirect to login page
  if (!token) {
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    const role = payload.role;

    // validate role
    if (role !== "admin" && role !== "user") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // USER direct to ADMIN
    if (role === "user" && pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // ADMIN direct to USER dashboard
    if (role === "admin" && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // Already login → No need to access login page
    if (pathname === "/login") {
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin" : "/dashboard", req.url),
      );
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login"],
};
