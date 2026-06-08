import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";

// Handle HTTP requests - GET, POST, PUT, DELETE, UPDATE
export async function GET() {
  try {
    const [products] = await db.query("SELECT * FROM products");
    return NextResponse.json(products);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("GET /api/fresh-produce failed:", err.message);
    } else {
      console.error("GET /api/fresh-produce failed:", err);
    }

    return NextResponse.json(
      {
        error: "Failed to fetch products",
      },
      { status: 500 },
    );
  }
}
