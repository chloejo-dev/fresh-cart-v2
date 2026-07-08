import Link from "next/link";
import styles from "./page.module.css";

export default function Page() {
  return (
    <main className={styles.orderSuccessPage}>
      <h1>Order placed, thank you!</h1>
      <p>Confirmation will be sent to your email.</p>
      <Link href='/'>Continue Shopping</Link>
    </main>
  );
}
