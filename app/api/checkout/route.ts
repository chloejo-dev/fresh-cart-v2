import { NextResponse } from "next/server";
import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import getUserIdFromToken from "@/lib/auth";

export async function GET() {
  try {
    // User sign in?
    const userId = await getUserIdFromToken();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user's address info
    const [addressRows] = await db.query<RowDataPacket[]>(
      `SELECT 
      user_id as userId,
      recipient_name as recipientName,
      phone,
      address_line1 as addressLine1,
      address_line2 as addressLine2,
      city,
      province,
      postal_code as postalCode,
      country
      FROM addresses WHERE user_id = ?`,
      [userId],
    );

    // Error handling
    if (addressRows.length === 0) {
      return NextResponse.json(
        { message: "No address found" },
        { status: 404 },
      );
    }

    // # of user = 1
    const userData = addressRows[0];

    // Get user's cart
    const [cartRows] = await db.query<RowDataPacket[]>(
      ` SELECT
        products.product_id as productId,
        products.product_pic as productPic,
        products.product_name as productName,
        products.product_price as productPrice,
        cart.quantity 
        FROM products
        LEFT JOIN cart
        ON products.product_id = cart.product_id
        WHERE cart.user_id = ?`,
      [userId],
    );

    // Error handling
    if (cartRows.length === 0) {
      return NextResponse.json({ message: "No cart found" }, { status: 404 });
    }
    // Send the data to client
    return NextResponse.json({ user: userData, cart: cartRows });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
