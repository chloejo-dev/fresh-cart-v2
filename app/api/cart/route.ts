import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";

interface CartItem extends RowDataPacket {
  cart_id: number;
  product_id: number;
  quantity: number;
  username: string;
}

export async function POST(request: Request) {
  try {
    const { product_id, username, quantity } = await request.json();

    // Check if product is already in user's cart
    const [rows] = await db.query<CartItem[]>(
      "SELECT * FROM cart WHERE product_id=? AND username=?",
      [product_id, username],
    );

    // Yes -> Update product quantity
    if (rows.length > 0) {
      await db.query(
        "UPDATE cart SET quantity=? WHERE product_id=? AND username=?",
        [quantity, product_id, username],
      );
      return NextResponse.json(
        {
          action: "update",
          message: "Quantity updated",
        },
        { status: 200 },
      );
    }
    // No -> Insert product info to user's cart
    else {
      await db.query(
        "INSERT INTO cart (product_id, quantity, username) VALUES (?, ?, ?)",
        [product_id, quantity, username],
      );
      return NextResponse.json(
        {
          action: "insert",
          message: "Product inserted",
        },
        { status: 200 },
      );
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("POST /api/cart failed:", err.message);
    } else {
      console.error("POST /api/cart failed:", err);
    }
    return NextResponse.json(
      { message: "Fail to update cart" },
      { status: 500 },
    );
  }
}
