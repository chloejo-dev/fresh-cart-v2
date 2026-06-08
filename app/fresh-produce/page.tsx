"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

// Define product type
type Product = {
  product_id: number;
  product_name: string;
  product_pic: string;
};

// Group the products into 3 for display
function sliceArray(arr: Product[], size: number): Product[][] {
  const chunkedArr: Product[][] = [];
  for (let index = 0; index < arr.length; index += size) {
    chunkedArr.push(arr.slice(index, index + size));
  }
  return chunkedArr;
}

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/fresh-produce");

        // If res fails, throw error
        // res.ok === true
        if (!res.ok) {
          throw new Error("Network response was not ok.");
        }

        // Data type = Product, data is an array of those elements
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err) {
        console.log("Error fetching data", err);
        setError("Failed to load products!");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // Products: raw array -> [{}, {}, {}, ... {}]
  // chuckedArr: altered array -> [[{}, {}, {}], [{}, {}, {}], ..]
  const chunkedArr = sliceArray(products, 3);
  // isLoading(true) = request in progress
  // isLoading(false) = request finished (success or error)
  if (isLoading) {
    return <p className={styles.loading}>Loading products...</p>;
  }

  // Handling fetching error
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <main className={styles.productsContainer}>
      {chunkedArr.map((chunk, index) => (
        <div key={index} className={styles.productRow}>
          {chunk.map((product) => (
            <div
              key={product.product_id}
              className={styles.singleProductContainer}
            >
              <Image
                src={product.product_pic}
                alt={`${product.product_name} image`}
                width={200}
                height={150}
                className={styles.productImage}
              />
              <Link href={`/fresh-produce/${product.product_id}`}>
                {product.product_name}
              </Link>
            </div>
          ))}
        </div>
      ))}
    </main>
  );
}
