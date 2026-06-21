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

type GuestProduct = {
  productId: number;
  productName: string;
  productPrice: number;
  productPic: string;
  quantity: number;
};

type cartStatus = "idle" | "updated" | "added" | "error" | "viewCart";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const paramsData = use(params);
  const { id } = paramsData;
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cartStatus, setCartStatus] = useState<cartStatus>("idle");
  const [isSignIn, setIsSignIn] = useState<boolean>(false);

  // Fetch/display single product data from DB
  useEffect(() => {
    async function fetchProduct() {
      try {
        // Fetch product data
        const res = await fetch(`/api/fresh-produce/${id}`);
        const data = await res.json();

        setProduct(data.product);
        setIsSignIn(data.isSignIn);

        // Set product quantity to display
        // User sign in?
        // N:
        if (data.isSignIn === false) {
          // Cart exists in local storage?
          const cart = localStorage.getItem("cart");

          if (cart) {
            // Y:
            const existingCart = JSON.parse(cart);
            // Current product exists in guest cart?
            // Y: stored quantity, N: 1

            const currentItem = existingCart.find(
              (item: GuestProduct) => item.productId === Number(id),
            );

            if (currentItem) {
              setQuantity(currentItem.quantity ?? 1);
            }
          }
          return;
        }

        setQuantity(data.product.quantity ?? 1);
      } catch (err) {
        console.error("Error fetching products", err);
      }
    }
    fetchProduct();
  }, [id]);

  // Update cart button text according to cart status
  const cartBtnText =
    cartStatus === "added"
      ? "Successfully Added to Cart!"
      : cartStatus === "updated"
        ? "Successfully Updated!"
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
    // User sign in?
    // Y => Store in DB
    if (isSignIn) {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: product.product_id,
            quantity,
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
          console.error("POST /api/cart failed:", err.message);
        } else {
          console.error("POST /api/cart failed:", err);
        }
        setCartStatus("error");
      }
    } else {
      // N:
      // Guest cart exists?
      const cart = localStorage.getItem("cart");

      // N:
      // Create cart array
      // Add current product to the array
      // Store the array in localStorage
      if (cart === null) {
        const guestCart: GuestProduct[] = [];
        guestCart.push({
          productId: product.product_id,
          productName: product.product_name,
          productPic: product.product_pic,
          productPrice: product.product_price,
          quantity,
        });
        localStorage.setItem("cart", JSON.stringify(guestCart));
        setCartStatus("added");
        return;
      }
      // Y:
      // Get the existing guest cart array
      const existingGuestCart: GuestProduct[] = JSON.parse(cart);
      // Current product exists in cart array?
      const currentItemIndex = existingGuestCart.findIndex(
        (item: GuestProduct) => item.productId === Number(id),
      );
      // N:
      // Add current product to the array
      // Store the updated array in localStorage
      if (currentItemIndex === -1) {
        existingGuestCart.push({
          productId: product.product_id,
          productName: product.product_name,
          productPic: product.product_pic,
          productPrice: product.product_price,
          quantity: quantity,
        });
        setCartStatus("added");
      } else {
        // Y: Update product quantity in guest cart
        if (existingGuestCart[currentItemIndex].quantity !== quantity) {
          existingGuestCart[currentItemIndex].quantity = quantity;
          setCartStatus("updated");
        } else {
          setCartStatus("viewCart");
        }
      }
      localStorage.setItem("cart", JSON.stringify(existingGuestCart));
    }
  };

  return (
    <main>
      <div className={styles.detailPageContainer}>
        <div className={styles.linkContainer}>
          <Link href='/fresh-produce' className={styles.link}>
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
    </main>
  );
}
