"use client";

import styles from "./page.module.css";
import Link from "next/link";

export default function Page() {
  const handleOrder = () => {
    console.log("Place order button clicked");
  };

  return (
    <main className={styles.checkoutPage}>
      <section className={styles.orderDetails}>
        <h2>Review order</h2>
        <div className={styles.shippingAddress}>
          <h2>Delivering to customer name</h2>
          <p>123 Sesame Street, Moncton, New Brunswick, E0A 0A1, Canada</p>
        </div>
        <div className={styles.orderItems}>
          <p>Product Image</p>
          <p>Quantity</p>
          <p>Product Name</p>
          <p>$xx</p>
        </div>
        <div className={styles.paymentMethod}>
          <h2>Paying with 1234</h2>
          <Link href='/change'>Change</Link>
        </div>
        <div className={styles.deliveryInfo}>
          <h2>Arriving Jun 29, 2026</h2>
        </div>
      </section>
      <section className={styles.orderSummary}>
        <button className={styles.orderButton} onClick={handleOrder}>
          Place Your Order
        </button>
        <div className={styles.orderSummaryDetails}>
          <p>Items (numberOfItems): $</p>
          <p>Shipping & Handling: $</p>
          <p>Estimated GST/HST: $</p>
          <h3>Order Total: $</h3>
        </div>
      </section>
    </main>
  );
}
