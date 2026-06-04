"use client";

import styles from "./page.module.css";
import Image from "next/image";
import { Trash2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

type CartItem = {
  product_name: string;
  product_id: number;
  product_price: number;
  product_pic: string;
};
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

  console.log("Browser", cartArr);

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
                  <button type='button'>
                    <Trash2 />
                  </button>
                  <span>1</span>
                  <button type='button'>
                    <Plus />
                  </button>
                  <button className={styles.deleteBtn}>Delete</button>
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
