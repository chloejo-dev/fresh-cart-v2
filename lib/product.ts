import db from "@/lib/db";
import { RowDataPacket } from "mysql2";

type Product = RowDataPacket & {
  productId: number;
  productName: string;
  productPrice: number;
  productDetails: string;
  productPic: string;
};

// Get single product data
export async function getProduct(
  slug: string,
  id: number,
): Promise<Product | null> {
  // Fetch single product data from DB
  const [rows] = await db.query<Product[]>(
    `SELECT product_id AS productId,
    product_name AS productName,
    product_price AS productPrice,
    product_details AS productDetails,
    product_pic AS productPic
    FROM products
    WHERE category_slug = ?
    AND product_id = ?`,
    [slug, id],
  );

  return rows[0] ?? null;
}
