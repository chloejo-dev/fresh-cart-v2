import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import type { ResultSetHeader } from "mysql2";

// Update product quantity in user's cart using PATCH
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Get product id info from frontend
  const { id } = await params;

  // Get quantity and username from frontend
  const { quantity, username } = await request.json();

  try {
    // Request DB to change product quantity
    const [rows] = await db.query<ResultSetHeader>(
      "UPDATE cart SET quantity = ? WHERE product_id = ? AND username= ?",
      [quantity, id, username],
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
      console.error(`POST /api/cart/${id} failed:`, err.message);
    } else {
      console.error(`POST /api/cart/${id} failed:`, err);
    }
    return NextResponse.json(
      { message: "Fail to change product quantity" },
      { status: 500 },
    );
  }
}

// Delete product if quantity === 0
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Get id and username info from frontend
  const { id } = await params;
  // request.json() is the body sent by frontend
  const { username } = await request.json();

  try {
    const [rows] = await db.query<ResultSetHeader>(
      "DELETE FROM cart WHERE product_id =? AND username=?",
      [id, username],
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
      console.error(`DELETE /api/cart/${id} failed:`, err.message);
    } else {
      console.error(`DELETE /api/cart/${id} failed:`, err);
    }
    return NextResponse.json(
      { message: "Fail to delete product" },
      { status: 500 },
    );
  }
}
