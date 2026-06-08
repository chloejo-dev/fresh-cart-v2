"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

type Product = {
  product_id: number;
  product_name: string;
  product_price: number;
  product_details: string;
  product_pic: string;
  quantity: number;
};

type cartStatus = "idle" | "updated" | "added" | "error" | "viewCart";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const paramsData = use(params);
  const { id } = paramsData;
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartStatus, setCartStatus] = useState<cartStatus>("idle");

  // Fetch/display single product data from DB
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
        setQuantity(data.quantity ?? 1);
      } catch (err) {
        console.log("Error fetching products", err);
      }
    }
    fetchProduct();
  }, [id]);

  // Update cart button text according to cart status
  const cartBtnText =
    cartStatus === "added"
      ? "Successfully Added to Cart!"
      : cartStatus === "updated"
        ? "Cart Successfully Updated!"
        : cartStatus === "viewCart"
          ? "View Cart"
          : "Add to Cart";

  // Update cart status after user adds product to cart
  useEffect(() => {
    if (cartStatus !== "added" && cartStatus !== "updated") return;

    const timer = setTimeout(() => {
      setCartStatus("viewCart");
    }, 1000);

    return () => clearTimeout(timer);
  }, [cartStatus]);

  // Adjust product quantity
  const increaseQty = () => {
    setQuantity((prev) => prev + 1);
    setCartStatus("idle");
  };

  const decreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
    setCartStatus("idle");
  };

  if (!product) {
    return <p>Loading...</p>;
  }

  // When clicked, add or update this product to user's cart
  const addToCart = async () => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.product_id,
          quantity: quantity,
          username: "testUser",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add product to cart.");
      }

      const data = await res.json();

      if (data.action === "update") {
        setCartStatus("updated");
      } else if (data.action === "insert") {
        setCartStatus("added");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("GET /api/cart failed:", err.message);
      } else {
        console.error("GET /api/cart failed:", err);
      }
      setCartStatus("error");
    }
  };

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
              <button
                type='button'
                onClick={decreaseQty}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button type='button' onClick={increaseQty}>
                +
              </button>
            </div>
            <div className={styles.btnContainer}>
              {cartStatus === "viewCart" ? (
                <Link href='/cart' className={styles.cartLink}>
                  View Cart
                </Link>
              ) : (
                <button className={styles.cartBtn} onClick={addToCart}>
                  {cartBtnText}
                </button>
              )}

              <button className={styles.buyBtn}>Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
