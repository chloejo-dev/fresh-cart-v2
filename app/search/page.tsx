import db from "@/lib/db";
import { RowDataPacket } from "mysql2";
import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

type Product = RowDataPacket & {
  productId: number;
  productName: string;
  productPrice: number;
  productPic: string;
  categorySlug: string;
};

// Display search results
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchWord = (await searchParams).q?.trim();

  // Search word exists?
  // N:
  if (!searchWord) {
    return <p>Please enter a search term.</p>;
  }

  // Search for products in DB
  const [rows] = await db.query<Product[]>(
    `SELECT
    product_id AS productId,
    product_name AS productName,
    product_price AS productPrice,
    product_pic AS productPic,
    category_slug AS categorySlug
    FROM products
    WHERE search_keyword
    LIKE ?`,
    [`${searchWord}%`],
  );

  // Render search results
  return (
    <main className={styles.searchResultPage}>
      <div className={styles.searchContainer}>
        <h1 className={styles.title}>Results for &quot;{searchWord}&quot;</h1>
        {rows.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className={styles.productGrid}>
            {rows.map((product) => (
              <div
                key={product.productId}
                className={styles.singleProductContainer}
              >
                <Link
                  href={`/products/${product.categorySlug}/${product.productId}`}
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
                  <p className={styles.productName}>{product.productName}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
