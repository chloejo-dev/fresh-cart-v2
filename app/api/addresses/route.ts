import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { recipientName } = await request.json();
  console.log(recipientName);
  return NextResponse.json({ message: "Success" }, { status: 200 });
}
