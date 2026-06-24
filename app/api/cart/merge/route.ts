import { NextResponse } from "next/server";
import getUserIdFromToken from "@/lib/auth";
import db from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

type ExistingCartRow = RowDataPacket & {
  product_id: number;
  quantity: number;
};

export async function POST(request: Request) {
  try {
    // Get user id from JWT verification helper function
    const userId = await getUserIdFromToken();

    // User not verified
    if (userId === null) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get guest cart data from client
    const { guestCart } = await request.json();

    // Check data type sent from client
    // null data type === object
    if (!Array.isArray(guestCart)) {
      return NextResponse.json(
        { message: "POST /api/cart/merge failed" },
        { status: 400 },
      );
    }

    if (guestCart.length === 0) {
      return NextResponse.json(
        { message: "Guest cart is empty" },
        { status: 400 },
      );
    }
    // Iterate over guest cart and search for each product in DB using for ... of
    for (const item of guestCart) {
      // product_id or quantity < 0 ?
      // Y:
      if (
        !Number.isInteger(item.product_id) ||
        item.product_id <= 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          { message: "POST /api/cart/merge failed" },
          { status: 400 },
        );
      }
      // N:
      // Current product already exists in user's cart?
      const [rows] = await db.query<ExistingCartRow[]>(
        "SELECT product_id, quantity FROM cart WHERE product_id = ? AND user_id = ?",
        [item.product_id, userId],
      );
      // N => Add it to user's cart
      if (rows.length === 0) {
        const [res] = await db.query<ResultSetHeader>(
          "INSERT INTO cart (product_id, quantity, user_id) VALUES(?, ?, ?)",
          [item.product_id, item.quantity, userId],
        );
        if (res.affectedRows === 0) {
          return NextResponse.json(
            { message: "POST /api/cart/merge failed" },
            { status: 400 },
          );
        }
      } else {
        // Y => Update its quantity
        // Get current product row
        const currentItem = rows[0];
        // Calculate a new quantity
        const newQuantity = item.quantity + currentItem.quantity;

        const [res] = await db.query<ResultSetHeader>(
          "UPDATE cart SET quantity = ? WHERE product_id = ? AND user_id = ?",
          [newQuantity, item.product_id, userId],
        );

        // Update success?
        // N:
        if (res.affectedRows === 0) {
          return NextResponse.json(
            { message: "POST /api/cart/merge failed" },
            { status: 400 },
          );
        }
      }
    }
    // All insert/update success
    return NextResponse.json(
      { message: "Guest cart successfully merged with user's existing cart" },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error("POST /api/cart/merge failed", err);
    return NextResponse.json(
      {
        message: "Failed to merge cart",
      },
      { status: 500 },
    );
  }
}
