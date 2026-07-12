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

const sliceArray = (arr: Product[], size: number): Product[][] => {
  const chunkedArr: Product[][] = [];
  for (let index = 0; index < arr.length; index += size) {
    chunkedArr.push(arr.slice(index, index + size));
  }
  return chunkedArr;
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

  const chunkedArr = sliceArray(productRows, 3);

  return (
    <main className={styles.productsPage}>
      {chunkedArr.map((chunk, index) => (
        <div key={index} className={styles.productRow}>
          {chunk.map((product) => (
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
      ))}
    </main>
  );
}
