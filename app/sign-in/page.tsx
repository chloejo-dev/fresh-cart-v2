"use client";
import styles from "./page.module.css";
import Link from "next/link";

export default function Page() {
  return (
    <main>
      <div className={styles.inputContainer}>
        <label>Username:</label>
        <input name='username'></input>
        <label>Password:</label>
        <input name='password'></input>
      </div>
      <button type='submit'>Sign In</button>
      <span>Don&apos;t have account?</span>
      <Link href='/sign-up'>Sign Up</Link>
    </main>
  );
}
