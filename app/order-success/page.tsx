import Link from "next/link";
import styles from "./page.module.css";

export default function Page() {
  return (
    <main className={styles.orderPage}>
      <p>Order placed, thank you!</p>
      <p>Confirmation will be sent to your email.</p>
      <Link href='/'>Continue Shopping</Link>
    </main>
  );
}
