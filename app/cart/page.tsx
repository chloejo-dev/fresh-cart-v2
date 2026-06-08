"use client";

import styles from "./page.module.css";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CartItem {
  product_name: string;
  product_id: number;
  product_price: number;
  product_pic: string;
  quantity: number;
}

export default function Page() {
  const [cartArr, setCartArr] = useState<CartItem[]>([]);
  const username = "testUser";

  // Fetch cart items info using product_id
  useEffect(() => {
    const fetchCartItems = async () => {
      const res = await fetch(`/api/cart?username=${username}`);
      const data = await res.json();
      setCartArr(data);
    };
    fetchCartItems();
  }, [username]);

  const increaseQty = async (id: number) => {
    // Find product current product using id
    const currentItem = cartArr.find((item) => item.product_id === id);

    // Type narrowing: Make sure currentItem is not undefined
    if (!currentItem) return;

    // Calculate new quantity
    const newQuantity = currentItem.quantity + 1;

    // Server-first change
    const res = await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: newQuantity,
        username: "testUser",
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      toast.error(data.message);
      return;
    }

    // Frontend => rerender cart page
    setCartArr((prev) =>
      prev.map((item) =>
        item.product_id === id
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item,
      ),
    );
  };

  const decreaseQty = async (id: number) => {
    // Find current product using id
    const currentItem = cartArr.find((item) => item.product_id === id);

    // Type narrowing: Make sure currentItem is not undefined
    if (!currentItem) return;

    // If currentItem quantity === 1, delete product
    if (currentItem.quantity === 1) {
      // Server-first change
      const res = await fetch(`/api/cart/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "testUser",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      // Frontend => delete product and rerender cart page
      setCartArr((prev) => prev.filter((item) => item.product_id !== id));
      toast.success(data.message);
      return;
    }

    // If currentItem quantity > 1, adjust product quantity
    // Calculate new quantity
    const newQuantity = currentItem.quantity - 1;

    // Server-first change
    const res = await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: newQuantity,
        username: "testUser",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    // Frontend => update quantity and rerender cart page
    setCartArr((prev) =>
      prev.map((item) =>
        item.product_id === id
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item,
      ),
    );
  };

  // Delete product when user click 'Delete' button
  const deleteItem = async (id: number) => {
    // Frontend => request backend to delete product
    const res = await fetch(`/api/cart/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "testUser",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.message);
      return;
    }

    // Frontend delete product from the current cart
    setCartArr((prev) => prev.filter((item) => item.product_id !== id));

    // Print delete success message
    toast.success(data.message);
  };

  // User has no items in their cart
  if (cartArr.length === 0) {
    return <p>Your cart is empty!</p>;
  }

  return (
    <main>
      <div className={styles.cartContainer}>
        {cartArr.map((item) => (
          <div key={item.product_id} className={styles.productRow}>
            <Image
              src={item.product_pic}
              alt='product image'
              width={200}
              height={150}
            ></Image>
            <div className={styles.productContainer}>
              <div className={styles.productInfoContainer}>
                <div className={styles.productDescContainer}>
                  <div className={styles.productTitle}>
                    <span>{item.product_name}</span>
                  </div>
                  <div className={styles.productPrice}>
                    <span>${item.product_price}</span>
                  </div>
                </div>

                <div className={styles.btnContainer}>
                  <button
                    type='button'
                    onClick={() => decreaseQty(item.product_id)}
                  >
                    {item.quantity === 1 ? <Trash2 /> : <Minus />}
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type='button'
                    onClick={() => increaseQty(item.product_id)}
                  >
                    <Plus />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteItem(item.product_id)}
                  >
                    Delete
                  </button>
                  <button className={styles.saveBtn}>Save for later</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
