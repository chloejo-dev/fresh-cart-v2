"use client";
import Link from "next/link";
import styles from "./page.module.css";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Page() {
  const [username, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [signInErr, setSignInErr] = useState<string>("");

  // Checkout button -> sign-in page -> redirect to checkout page
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  let usernameError = ""; // derived value (username)
  let passwordError = ""; // derived value (password)

  const router = useRouter();

  // Real-time validation for UX: username, password
  // required attribute: prevent any empty input fields
  if (username.includes(" ")) {
    usernameError = "Username cannot contain spaces";
  } else if (username.length > 0 && username.length < 5) {
    usernameError = "Username should be at least 5 characters";
  }

  if (password.length > 0 && password.length < 10) {
    passwordError = "Password should be at least 10 characters";
  }

  const handleSignIn: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setSignInErr("");
    // Get user entered info from the form using a FormData object
    const formData = new FormData(e.currentTarget);

    // Make sure data type === string for username and password
    const enteredUsername = String(formData.get("username") ?? "").trim();
    const enteredPassword = String(formData.get("password") ?? "");

    // Frontend validation
    if (enteredUsername.includes(" ")) {
      return;
    }

    if (enteredUsername.length < 5) {
      return;
    }

    if (enteredPassword.length < 10) {
      return;
    }

    // Frontend makes a "POST" request only when the provided info is accurate
    const res = await fetch("/api/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: enteredUsername,
        password: enteredPassword,
      }),
    });

    const data = await res.json();

    // Sign in fail?
    // Y:
    if (!res.ok) {
      setSignInErr(data.message);
      return;
    }

    // N => Get guest cart from local storage to merge with user's existing cart
    // Guest cart?
    const guestCart = localStorage.getItem("cart");

    // Y:
    if (guestCart) {
      try {
        const parsedGuestCart = JSON.parse(guestCart);

        // Send guest cart to make a POST request
        if (Array.isArray(parsedGuestCart) && parsedGuestCart.length > 0) {
          // Call cart/merge API
          const res = await fetch("/api/cart/merge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              guestCart: parsedGuestCart,
            }),
          });

          // Merge fail?
          if (!res.ok) {
            throw new Error("Failed to merge guest cart with user's cart.");
          }
          // Delete guest cart from local storage
          localStorage.removeItem("cart");
        }
      } catch (error) {
        console.error(error);
        // Let user know if merge fails
        setSignInErr("Failed to merge guest cart with your account.");
        return;
      }
    }

    // If sign in is a success, redirect to the website main or checkout page
    router.push(redirect ?? "/");
  };

  return (
    <main>
      <form onSubmit={handleSignIn}>
        <div className={styles.signInContainer}>
          <div className={styles.inputContainer}>
            <div className={styles.formGroup}>
              <label>Username:</label>
              <input
                type='text'
                name='username'
                required
                autoComplete='username'
                onChange={(e) => setUserName(e.target.value)}
              ></input>
              {usernameError && <p>{usernameError}</p>}
              <label>Password:</label>
              <input
                type='password'
                name='password'
                required
                autoComplete='current-password'
                onChange={(e) => setPassword(e.target.value)}
              ></input>
              {passwordError && <p>{passwordError}</p>}
            </div>
            {signInErr && <p>{signInErr}</p>}
          </div>
          <button type='submit' className={styles.signInBtn}>
            Sign In
          </button>
          <div className={styles.signUpContainer}>
            <span>Don&apos;t have an account?</span>
            <Link href='/sign-up'>Sign Up</Link>
          </div>
        </div>
      </form>
    </main>
  );
}
