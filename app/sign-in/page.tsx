"use client";
import Link from "next/link";
import styles from "./page.module.css";

export default function Page() {
  return (
    <main>
      <div className={styles.signInContainer}>
        <div className={styles.inputContainer}>
          <div className={styles.formGroup}>
            <label>Username:</label>
            <input
              type='text'
              name='username'
              required
              autoComplete='username'
            ></input>
            <label>Password:</label>
            <input
              type='password'
              name='password'
              required
              autoComplete='current-password'
            ></input>
          </div>
        </div>
        <button type='submit' className={styles.signInBtn}>
          Sign In
        </button>
        <div className={styles.signUpContainer}>
          <span>Don&apos;t have an account?</span>
          <Link href='/sign-up'>Sign Up</Link>
        </div>
      </div>
    </main>
  );
}
