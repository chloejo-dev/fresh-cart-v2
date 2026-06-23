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

    // User sign in?
    // Y => show product quantity stored in user's cart
    const userId = await getUserIdFromToken();
    const isSignIn = userId !== null;

    // Fetch product data
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

    // Explicit error handling: Product not found
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }

    // Send product data and sign in status to client
    return NextResponse.json({ product, isSignIn });
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
