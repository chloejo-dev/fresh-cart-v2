import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

type User = RowDataPacket & {
  userId: number;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

type CartItem = RowDataPacket & {
  productId: number;
  productPic: string;
  productName: string;
  productPrice: number;
  productQuantity: number;
};

// getCheckoutInfo => Check DB info
export default async function getCheckoutInfo(userId: number) {
  // User address exists in DB?
  const [addressRows] = await db.query<User[]>(
    `SELECT 
      user_id AS userId,
      recipient_name AS recipientName,
      phone,
      address_line1 AS addressLine1,
      address_line2 AS addressLine2,
      city,
      province,
      postal_code AS postalCode,
      country
      FROM addresses WHERE user_id = ?`,
    [userId],
  );

  // User cart exists in DB?
  const [cartRows] = await db.query<CartItem[]>(
    ` SELECT
        products.product_id AS productId,
        products.product_pic AS productPic,
        products.product_name AS productName,
        products.product_price AS productPrice,
        cart.quantity AS productQuantity
        FROM cart
        INNER JOIN products
        ON products.product_id = cart.product_id
        WHERE cart.user_id = ?`,
    [userId],
  );

  return {
    user: addressRows[0] ?? null,
    cart: cartRows,
  };
}
