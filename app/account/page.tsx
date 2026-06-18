"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Image from "next/image";

type User = {
  username: string;
  email: string;
  joined_date: string;
};

export default function Page() {
  const [currentUser, setCurrentUser] = useState<User>();
  // const [signInErr, setSignInErr] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    // Make a GET request to fetch current user info
    const fetchUser = async () => {
      // User sign in?
      const res = await fetch("/api/me");
      // N:
      if (!res.ok) {
        console.log("Please sign in");
        router.push("/sign-in");
        return;
      }
      // Y:
      const data = await res.json();
      setCurrentUser(data);
      console.log(data);
    };

    fetchUser();
  }, [router]);

  if (!currentUser) {
    return <p>Please sign in...</p>;
  }

  return (
    <main className={styles.main}>
      <h1>Your Account</h1>
      <div className={styles.userInfoContainer}>
        <Image
          src='/images/profile-picture.png'
          alt='default user profile picture'
          width={200}
          height={200}
        />
        <div className={styles.group}>
          <p>Username: {currentUser.username}</p>
          <p>Email: {currentUser.email}</p>
          <p>Member Since: {currentUser.joined_date}</p>
        </div>
      </div>
      <div className={styles.buttonContainer}>
        <button
          type='submit'
          className={`${styles.button} ${styles.primaryButton}`}
        >
          Logout
        </button>
        <button
          type='submit'
          className={`${styles.button} ${styles.secondaryButton}`}
        >
          Change Password
        </button>
      </div>
    </main>
  );
}
