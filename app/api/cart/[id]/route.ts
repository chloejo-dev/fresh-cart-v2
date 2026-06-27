import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import type { ResultSetHeader } from "mysql2";
import getUserIdFromToken from "@/lib/auth";

// Update product quantity in user's cart using PATCH
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get product id info from frontend
    const { id } = await params;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json(
        { message: "Invalid product id" },
        { status: 400 },
      );
    }
    // Get quantity from frontend
    const { quantity } = await request.json();

    const isValidBody = Number.isInteger(quantity) && quantity > 0;

    if (!isValidBody) {
      return NextResponse.json(
        { message: "Invalid json body" },
        { status: 400 },
      );
    }
    // Check if user has signed in
    const userId = await getUserIdFromToken();

    if (userId === null) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Request DB to change product quantity
    const [rows] = await db.query<ResultSetHeader>(
      "UPDATE cart SET quantity = ? WHERE product_id = ? AND user_id= ?",
      [quantity, productId, userId],
    );

    // Error handling
    if (rows.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "Item not found in user's cart",
        },
        { status: 404 },
      );
    }

    // Send response to frontend
    return NextResponse.json(
      {
        result: "Success",
      },
      { status: 200 },
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("PATCH /api/cart/[id] failed:", err.message);
    } else {
      console.error("PATCH /api/cart/[id] failed:", err);
    }
    return NextResponse.json(
      { message: "Failed to change product quantity" },
      { status: 500 },
    );
  }
}

// Delete product if quantity === 0
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Get id info from frontend
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return NextResponse.json(
      { message: "Invalid product id" },
      { status: 400 },
    );
  }

  // Check if user has signed in
  const userId = await getUserIdFromToken();

  // N:
  if (userId === null) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [rows] = await db.query<ResultSetHeader>(
      "DELETE FROM cart WHERE product_id =? AND user_id=?",
      [productId, userId],
    );

    // Error handling
    if (rows.affectedRows === 0) {
      return NextResponse.json(
        {
          message: "Item not found in user's cart",
        },
        { status: 404 },
      );
    }

    // Return response to frontend
    return NextResponse.json(
      { message: "Product successfully deleted" },
      { status: 200 },
    );
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("DELETE /api/cart/[id] failed:", err.message);
    } else {
      console.error("DELETE /api/cart/[id] failed:", err);
    }
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
