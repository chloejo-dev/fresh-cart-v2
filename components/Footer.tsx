import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.brand}>
          <Image
            src='/images/logo-removebg-preview.png'
            alt='Fresh Cart logo'
            width={40}
            height={40}
            className={styles.logoImage}
          />
          <span>Fresh Cart</span>
        </div>
        <div className={styles.links}>
          <Link href='/products/fresh-produce'>Fresh Produce</Link>
          <Link href='/products/meat'>Meat</Link>
          <Link href='/products/seafood'>Seafood</Link>
          <Link href='/products/dairy'>Dairy</Link>
        </div>
        <div className={styles.info}>
          <p>© 2026 Fresh Cart Inc.</p>
          <p>123 Green Street, Moncton, NB, Canada</p>
        </div>
      </footer>
    </>
  );
}
