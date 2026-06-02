"use client";
import Link from "next/link";
import Image from "next/image";
import Search from "./Search";
import styles from "@/components/Header.module.css";

export default function Header() {
  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.left}>
          <div className={styles.logoContainer}>
            <Image
              src='/images/logo-removebg-preview.png'
              alt='fresh cart logo image'
              width={50}
              height={50}
            />
            <Link href='/'>Fresh Cart</Link>
          </div>
        </div>
        <div className={styles.center}>
          <Search />
        </div>

        <div className={styles.right}>
          <nav className={styles.userMenu}>
            <Link href='/reorder'>Reorder</Link>
            <Link href='/account'>Account</Link>
            <Link href='/signIn' className={styles.authBtn}>
              Sign In
            </Link>

            <div className={styles.cartIcon}>
              <Link href='/cart'>
                🛒 <span id='cart-total'></span>
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <div className={styles.categoryStrip}>
        <Link href='/freshProduce' className={styles.category}>
          Fresh Produce
        </Link>
        <Link href='/meat' className={styles.category}>
          Meat
        </Link>
        <Link href='/seafood' className={styles.category}>
          Seafood
        </Link>
        <Link href='/dairy' className={styles.category}>
          Dairy
        </Link>
      </div>
    </>
  );
}
