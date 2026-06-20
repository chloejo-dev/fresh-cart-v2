import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import getUserIdFromToken from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get product id
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { message: "Invalid product id" },
        { status: 400 },
      );
    }

    // Check if user has signed in. If yes, show product quantity stored in user's cart
    const userId = await getUserIdFromToken();

    // N:
    if (userId === null) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
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
        AND cart.user_id= ?
        WHERE products.product_id= ?`,
      [userId, productId],
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
      console.error(`GET /api/freshProduce/[id] failed`, err.message);
    } else {
      console.error(`GET /api/freshProduce/[id] failed`, err);
    }

    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
