import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // Delete cookie
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  return NextResponse.json(
    { message: "Signed out successfully" },
    { status: 200 },
  );
}
