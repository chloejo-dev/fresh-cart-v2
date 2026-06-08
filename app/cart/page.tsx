"use client";

import styles from "./page.module.css";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
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
  const [msg, setMsg] = useState<string>("");

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

    const newQuantity = currentItem.quantity + 1;

    // Frontend => update quantity and rerender cart page
    setCartArr((prev) =>
      prev.map((item) =>
        item.product_id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );

    // Frontend => backend to request quantity change
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
      const errorData = await res.json();

      toast.error(errorData.message);
      return;
    }
  };

  const decreaseQty = async (id: number) => {
    // Find current product using id
    const currentItem = cartArr.find((item) => item.product_id === id);

    // Type narrowing: Make sure currentItem is not undefined
    if (!currentItem) return;

    // Check currentItem quantity === 1 or > 1
    if (currentItem.quantity === 1) {
      // Frontend => delete product and rerender cart page
      setCartArr((prev) => prev.filter((item) => item.product_id !== id));

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
      toast.success(data.message);
    }

    // Calculate new quantity
    const newQuantity = currentItem.quantity - 1;

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

    // Frontend => backend to request quantity change
    await fetch(`/api/cart/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity: newQuantity,
        username: "testUser",
      }),
    });
  };

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
                  <button className={styles.deleteBtn}>Delete</button>
                  <button className={styles.saveBtn}>Save for later</button>
                </div>
                <div className={styles.msg}>
                  <Toaster />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
