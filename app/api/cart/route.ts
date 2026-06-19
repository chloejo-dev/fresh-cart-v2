import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface CartItem extends RowDataPacket {
  product_id: number;
  quantity: number;
  product_name: string;
  product_price: number;
  product_pic: string;
}

// Get all items from user's cart
export async function GET() {
  try {
    // Check if user has signed in
    const userId = await getUserIdFromToken();

    // N:
    if (userId === null) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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
      WHERE cart.user_id=?`,
      [userId],
    );

    return NextResponse.json(rows, { status: 200 });
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
    // Check if user has signed in
    const userId = await getUserIdFromToken();

    // N:
    if (userId === null) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await request.json();
    // Error handling
    if (typeof productId !== "number" || typeof quantity !== "number") {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }

    // Check if product is already in user's cart
    const [rows] = await db.query<CartItem[]>(
      "SELECT product_id FROM cart WHERE product_id=? AND user_id=?",
      [productId, userId],
    );

    // Yes -> Update product quantity
    if (rows.length > 0) {
      await db.query(
        "UPDATE cart SET quantity=? WHERE product_id=? AND user_id=?",
        [quantity, productId, userId],
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
        "INSERT INTO cart (product_id, quantity, user_id) VALUES (?, ?, ?)",
        [productId, quantity, userId],
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

// helper function to verify user's JWT
async function getUserIdFromToken() {
  try {
    // Get user's cookie and token
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    // Token exists?
    // N:
    if (!token) {
      return null;
    }

    // Verify token
    const verifiedToken = jwt.verify(token.value, process.env.JWT_SECRET!);

    if (typeof verifiedToken !== "object" || verifiedToken === null) {
      return null;
    }

    const userId = verifiedToken.userId;

    if (typeof userId !== "number") {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}
