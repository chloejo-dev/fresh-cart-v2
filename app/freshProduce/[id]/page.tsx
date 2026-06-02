"use client";
import { use, useEffect, useState, ChangeEventHandler } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

type Product = {
  product_id: number;
  product_name: string;
  product_price: number;
  product_details: string;
  product_pic: string;
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const paramsData = use(params);
  const { id } = paramsData;
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/freshProduce/${id}`);

        // If res fails, throw error
        // res.ok === true
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.log("Error fetching products", err);
      }
    }
    fetchProduct();
  }, [id]);

  if (!product) {
    return <p>Loading...</p>;
  }

  //   const handleQuantityChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
  //     setQuantity(+e.target.value);
  //   };

  const increaseQty = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  function addToCart() {
    console.log("Cart button clicked!");
  }

  return (
    <>
      <div className={styles.detailPageContainer}>
        <div className={styles.linkContainer}>
          <Link href='/freshProduce' className={styles.link}>
            Go Back to Fresh Produce List
          </Link>
        </div>
        <div className={styles.productContainer}>
          <div className={styles.imageContainer}>
            <Image
              className={styles.productImage}
              src={product.product_pic}
              alt={product.product_name}
              width={200}
              height={150}
            />
          </div>
          <div className={styles.productInfoContainer}>
            <h1>{product.product_name}</h1>
            <p>{product.product_details}</p>
            <p>${product.product_price}</p>
            <div className={styles.quantityContainer}>
              <span>Quantity: </span>
              <button onClick={decreaseQty}>-</button>
              <span>{quantity}</span>
              <button onClick={increaseQty}>+</button>
            </div>
            <div className={styles.btnContainer}>
              <button className={styles.cartBtn} onClick={addToCart}>
                Add to Cart
              </button>
              <button className={styles.buyBtn}>Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
