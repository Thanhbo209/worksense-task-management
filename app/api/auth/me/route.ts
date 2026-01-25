import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/jwt";
import { connectDB } from "@/app/lib/db";
import { User } from "@/app/lib/models/User";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    await connectDB();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}
