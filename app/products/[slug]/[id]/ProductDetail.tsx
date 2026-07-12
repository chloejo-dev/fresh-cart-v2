"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

// Product data type sent from server
type Product = {
  productId: number;
  productName: string;
  productPrice: number;
  productDetails: string;
  productPic: string;
};

// Props type sent from server
type ProductDetailProps = {
  product: Product;
  isSignIn: boolean;
  cartQuantity: number | null;
};

// Guest cart data type
type GuestProduct = {
  productId: number;
  productName: string;
  productPrice: number;
  productPic: string;
  productQuantity: number;
};

type CartStatus = "idle" | "updated" | "added" | "error" | "viewCart";

export default function ProductDetail({
  product,
  isSignIn,
  cartQuantity,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(cartQuantity ?? 1);
  const [cartStatus, setCartStatus] = useState<CartStatus>("idle");

  useEffect(() => {
    // Cart quantity exists?
    // Y => No need to set up initial product quantity
    if (isSignIn) return;

    // Set product quantity: guest cart quantity or 1
    try {
      // Guest cart exists in local storage?
      const cart = localStorage.getItem("cart");

      // N:
      if (!cart) return;
      // Y:
      const existingCart: GuestProduct[] = JSON.parse(cart);

      // Current product exists in guest cart?
      const currentItem = existingCart.find(
        (item: GuestProduct) => item.productId === product.productId,
      );

      // Y => Store product quantity from guest cart
      // N => 1
      if (currentItem) {
        setQuantity(currentItem.productQuantity);
      }
    } catch (err) {
      console.error("Error setting product initial quantity", err);
    }
  }, [isSignIn, product.productId]);

  // Update cart button text according to cart status
  const cartButtonText =
    cartStatus === "added"
      ? "Successfully Added to Cart!"
      : cartStatus === "updated"
        ? "Successfully Updated!"
        : cartStatus === "viewCart"
          ? "View Cart"
          : cartStatus === "error"
            ? "Oops, Something Went Wrong"
            : "Add to Cart";

  // Update cart status after user adds product to cart
  useEffect(() => {
    if (cartStatus !== "added" && cartStatus !== "updated") return;

    const timer = setTimeout(() => {
      setCartStatus("viewCart");
    }, 1000);

    return () => clearTimeout(timer);
  }, [cartStatus]);

  // Change product quantity
  const increaseQty = () => {
    setQuantity((prev) => prev + 1);
    setCartStatus("idle");
  };

  const decreaseQty = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
    setCartStatus("idle");
  };

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
            productId: product.productId,
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
      try {
        const cart = localStorage.getItem("cart");
        // N:
        // Create cart array
        // Add current product to the array
        // Store the array in localStorage
        if (cart === null) {
          const guestCart: GuestProduct[] = [];

          guestCart.push({
            productId: product.productId,
            productName: product.productName,
            productPic: product.productPic,
            productPrice: product.productPrice,
            productQuantity: quantity,
          });

          localStorage.setItem("cart", JSON.stringify(guestCart));
          setCartStatus("added");
          return;
        }
        // Y:
        // Get the existing guest cart array
        const existingGuestCart: GuestProduct[] = JSON.parse(cart);

        // Current product exists in cart array?
        // findIndex(): Index or -1 returned
        const currentItemIndex = existingGuestCart.findIndex(
          (item: GuestProduct) => item.productId === product.productId,
        );
        // N:
        // Add current product to the array
        // Store the updated array in localStorage
        if (currentItemIndex === -1) {
          existingGuestCart.push({
            productId: product.productId,
            productName: product.productName,
            productPic: product.productPic,
            productPrice: product.productPrice,
            productQuantity: quantity,
          });
          setCartStatus("added");
        } else {
          // Y: Update product quantity in guest cart
          if (
            existingGuestCart[currentItemIndex].productQuantity !== quantity
          ) {
            existingGuestCart[currentItemIndex].productQuantity = quantity;
            setCartStatus("updated");
          } else {
            setCartStatus("viewCart");
          }
        }
        localStorage.setItem("cart", JSON.stringify(existingGuestCart));
      } catch (err: unknown) {
        console.error(err);
        setCartStatus("error");
      }
    }
  };

  return (
    <>
      <div className={styles.quantityContainer}>
        <span>Quantity: </span>
        <button type='button' onClick={decreaseQty} disabled={quantity <= 1}>
          -
        </button>
        <span>{quantity}</span>
        <button type='button' onClick={increaseQty}>
          +
        </button>
      </div>
      <div className={styles.buttonContainer}>
        {cartStatus === "viewCart" ? (
          <Link href='/cart' className={styles.cartLink}>
            View Cart
          </Link>
        ) : (
          <button
            className={styles.cartButton}
            onClick={addToCart}
            type='button'
          >
            {cartButtonText}
          </button>
        )}
        <button className={styles.buyButton} type='button'>
          Buy Now (Coming Soon)
        </button>
      </div>
    </>
  );
}
