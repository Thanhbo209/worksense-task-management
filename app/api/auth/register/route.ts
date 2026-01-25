import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/lib/models/User";
import { hashPassword } from "@/app/utils/password";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json(); // GET DATA FROM REQ BODY
    const { name, email, password } = body; // DESTRUCTURING

    // VALIDATE
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 },
      );
    }

    // HASH PASSWORD
    const hassedPassword = await hashPassword(password);

    // CREATE USER
    const newUser = await User.create({
      name,
      email,
      password: hassedPassword,
    });

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 },
    );
  }
}
