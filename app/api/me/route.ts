import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/getCurrentUser";

export async function GET() {
  try {
    // Refactoring
    // currentUser = null or rows[0]
    const currentUser = await getCurrentUser();

    if (currentUser === null) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(currentUser);
  } catch (err: unknown) {
    console.error(err);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
