import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/lib/models/User";
import { hashPassword } from "@/app/utils/password";

const GENERIC_REGISTER_ERROR = "Cannot register user at the moment";
const FIELD_REGISTER_ERROR = "Some fields are missing or invalid";

export async function POST(req: Request) {
  try {
    await connectDB();
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: GENERIC_REGISTER_ERROR },
        { status: 400 },
      );
    }

    // EXTRACT AND TRIM FIELDS
    // Trim name to remove leading/trailing spaces
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    // Trim email to remove leading/trailing spaces
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    // Use the password as is
    const password = typeof body?.password === "string" ? body.password : "";

    // VALIDATE
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: FIELD_REGISTER_ERROR },
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
        { message: GENERIC_REGISTER_ERROR },
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

    const userObj = newUser.toObject();
    delete userObj.password;
    return NextResponse.json(
      { message: "Registration successful", user: userObj },
      { status: 201 },
    );
  } catch {
    console.error("Register failed");
    return NextResponse.json(
      { message: GENERIC_REGISTER_ERROR },
      { status: 500 },
    );
  }
}
