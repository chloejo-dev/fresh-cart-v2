import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.title}>Freshness Delivered to Your Door.</h1>
        <p>Support local farmers and get 20% off your first reorder.</p>
        <br />
        <Link href='products/fresh-produce' className={styles.ctaMain}>
          Shop Now
        </Link>
      </div>
    </main>
  );
}
