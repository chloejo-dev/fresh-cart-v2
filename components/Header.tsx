"use client";
import Link from "next/link";
import Image from "next/image";
import Search from "./Search";
import styles from "@/components/Header.module.css";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const [isSignIn, setIsSignIn] = useState<boolean>(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check if user has signed in using /api/me
    const checkSignIn = async () => {
      const res = await fetch("/api/me");

      if (!res.ok) {
        // N:
        setIsSignIn(false);
        return;
      }

      // Y:
      setIsSignIn(true);
    };

    checkSignIn();
  }, [pathname]);

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/sign-out", { method: "POST" });

      if (!res.ok) {
        console.error("Failed to sign out");
        return;
      }
      setIsSignIn(false);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };
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
            {isSignIn ? (
              <button className={styles.authButton} onClick={handleSignOut}>
                Sign Out
              </button>
            ) : (
              <Link href='/sign-in' className={styles.authButton}>
                Sign In
              </Link>
            )}

            <div className={styles.cartIcon}>
              <Link href='/cart'>
                🛒 <span id='cart-total'></span>
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <div className={styles.categoryStrip}>
        <Link href='/fresh-produce' className={styles.category}>
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
