import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";
// interface Product extends RowDataPacket {
//   cart_id: number;
//   product_id: number;
//   quantity: number;
//   product_name: string;
//   product_price: number;
//   product_pic: string;
// }

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userName = "testUser";
  console.log("ID: ", id);
  try {
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
        AND cart.username=?
        WHERE products.product_id=?`,
      [userName, id],
    );
    const product = rows[0];
    return NextResponse.json(product);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`GET /api/freshProduce/${id} failed`, err.message);
    } else {
      console.error(`GET /api/freshProduce/${id} failed`, err);
    }

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
