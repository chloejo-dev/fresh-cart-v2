import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT * FROM groceries WHERE product_id=?",
      [id],
    );
    const product = rows[0];
    return NextResponse.json(product);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`GET /api/freshProduce/${id} failed`, err.message);
    } else {
      console.error(`GET /api/freshProduce/${id} failed`, err);
    }

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
