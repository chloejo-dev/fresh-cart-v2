import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userName = "testUser";
  console.log("ID: ", id);
  try {
    // Check if product in user cart
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT
        products.product_id,
        products.product_pic,
        products.product_name,
        products.product_price,
        products.product_details,
        cart.quantity
        FROM products
        LEFT JOIN cart
        ON products.product_id = cart.product_id
        AND cart.username=?
        WHERE products.product_id=?`,
      [userName, id],
    );

    const product = rows[0];

    // Explicit error handling
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

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
