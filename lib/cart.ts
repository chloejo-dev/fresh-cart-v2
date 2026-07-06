import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

type CartItem = RowDataPacket & {
  productId: number;
  productName: string;
  productPrice: number;
  productPic: string;
  productQuantity: number;
};

export async function getCartQuantity(
  userId: number,
  productId: number,
): Promise<number | null> {
  // Product exists in user's cart?
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?",
    [userId, productId],
  );

  // Y => e.g. [{quantity: 5}] => rows[0].quantity
  // N => []
  return rows[0]?.quantity ?? null;
}

export async function getCartItems(userId: number): Promise<CartItem[]> {
  const [rows] = await db.query<CartItem[]>(
    `SELECT
    products.product_id AS productId,
    products.product_name AS productName,
     products.product_pic AS productPic,
    products.product_price AS productPrice,
    cart.quantity AS productQuantity
    FROM cart
    INNER JOIN products
    ON products.product_id = cart.product_id
    WHERE cart.user_id = ?`,
    [userId],
  );

  return rows;
}
