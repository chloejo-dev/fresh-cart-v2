import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { notFound } from "next/navigation";

// Define product type
type Product = RowDataPacket & {
  productId: number;
  productName: string;
  productPrice: number;
  productPic: string;
};

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

  // Fetch products data directly from DB
  const [productRows] = await db.query<Product[]>(
    `SELECT product_id AS productId, 
    product_name AS productName,
    product_price AS productPrice,
    product_pic AS productPic
    FROM products WHERE category_slug = ? `,
    [slug],
  );

  if (productRows.length === 0) notFound();

  return (
    <main className={styles.productsPage}>
      <div className={styles.productsGrid}>
        {productRows.map((product) => (
          <div
            key={product.productId}
            className={styles.singleProductContainer}
          >
            <Link
              href={`/products/${slug}/${product.productId}`}
              className={styles.productCard}
            >
              <div className={styles.imageWrapper}>
                <Image
                  src={product.productPic}
                  alt={`${product.productName} image`}
                  width={200}
                  height={150}
                  className={styles.productImage}
                />
              </div>
              <p className={styles.productPrice}>${product.productPrice}</p>
              <p className={styles.productName}> {product.productName}</p>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
