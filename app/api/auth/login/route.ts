import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/lib/models/User";
import { comparePassword } from "@/app/utils/password";
import { signToken } from "@/app/utils/jwt";
import { cookies } from "next/headers";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectDB();

    /// Parse the request body
    const body = await request.json();
    const { email, password } = body;
    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    // Validate input
    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { message: INVALID_CREDENTIALS_MESSAGE },
        { status: 400 },
      );
    }
    // Find the user by email and include the password field
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    // Fake hash to mitigate timing attacks when user doesn't exist
    const hashedPassword =
      user?.password ??
      "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    // Compare the provided password with the stored hashed password
    const isMatch = await comparePassword(password, hashedPassword);

    if (!user || !isMatch) {
      return NextResponse.json(
        { message: INVALID_CREDENTIALS_MESSAGE },
        { status: 401 },
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Get cookie store
    const cookieStore = await cookies();
    // Set cookie
    cookieStore.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Successful login
    const userObj = user.toObject();
    delete userObj.password; // Remove password before sending response
    return NextResponse.json({ user: userObj }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
