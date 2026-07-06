import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import { ResultSetHeader, type RowDataPacket } from "mysql2";
import getUserIdFromToken from "@/lib/auth";

interface ExistingCartItemRow extends RowDataPacket {
  productId: number;
}

// Add or update a product in user's cart
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
    const isValidBody =
      Number.isInteger(productId) &&
      productId > 0 &&
      Number.isInteger(quantity) &&
      quantity > 0;

    if (!isValidBody) {
      return NextResponse.json(
        { message: "Invalid json body" },
        { status: 400 },
      );
    }

    // Check if product is already in user's cart
    const [rows] = await db.query<ExistingCartItemRow[]>(
      "SELECT product_id AS productId FROM cart WHERE product_id= ? AND user_id= ?",
      [productId, userId],
    );

    // Yes -> Update product quantity
    if (rows.length > 0) {
      await db.query(
        "UPDATE cart SET quantity=? WHERE product_id= ? AND user_id= ?",
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
      const [res] = await db.query<ResultSetHeader>(
        "INSERT INTO cart (product_id, quantity, user_id) VALUES (?, ?, ?)",
        [productId, quantity, userId],
      );

      if (res.affectedRows === 0) {
        return NextResponse.json(
          { message: "POST /api/cart failed" },
          { status: 400 },
        );
      }

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
      { message: "Failed to update cart" },
      { status: 500 },
    );
  }
}
