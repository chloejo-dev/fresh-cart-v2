import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";

interface CartItem extends RowDataPacket {
  cart_id: number;
  product_id: number;
  quantity: number;
  product_name: string;
  product_price: number;
  product_pic: string;
}

// Get all items from user's cart
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get("username");

    const [rows] = await db.query<CartItem[]>(
      `SELECT
      cart.quantity,
      products.product_id,
      products.product_name,
      products.product_price,
      products.product_pic
      FROM cart
      INNER JOIN products
      ON cart.product_id = products.product_id
      WHERE username=?`,
      [userName],
    );

    const cartItems = rows;
    return NextResponse.json(cartItems, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("GET /api/cart failed:", err.message);
    } else {
      console.error("GET /api/cart failed:", err);
    }
    return NextResponse.json(
      { message: "Fail to fetch cart items" },
      { status: 500 },
    );
  }
}

// Add product(s) to user's cart
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
        { status: 201 },
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
