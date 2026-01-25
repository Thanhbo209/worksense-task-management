import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/lib/models/User";
import { comparePassword } from "@/app/utils/password";

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectDB();

    /// Parse the request body
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }
    // Find the user by email and include the password field
    const user = await User.findOne({ email }).select("+password");
    // If user not found or password does not match, return error
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await comparePassword(password, user.password);

    // If password does not match, return error
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Successful login
    const userObj = user.toObject();
    delete userObj.password; // Remove password before sending response
    return NextResponse.json({ user: userObj }, { status: 200 });
  } catch (error) {
    console.error("Login Failed");
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 },
    );
  }
}
