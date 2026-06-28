"use client";
import Link from "next/link";
import styles from "./page.module.css";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { redirectMap } from "@/lib/redirect";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signInErr, setSignInErr] = useState("");

  // Checkout button -> sign-in page -> redirect to checkout page
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  // Validate redirect route
  const safeRedirect =
    redirect && redirect in redirectMap
      ? redirectMap[redirect as keyof typeof redirectMap]
      : "/";

  let emailError = ""; // derived value (email)
  let passwordError = ""; // derived value (password)

  // Real-time validation for UX: email, password
  // required attribute: prevent any empty input fields
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email);

  if (email.length > 0 && !isValidEmail) {
    emailError = "Please enter a valid email address";
  }

  if (password.length > 0 && password.length < 10) {
    passwordError = "Password should be at least 10 characters";
  }

  const handleSignIn: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setSignInErr("");
    // Get user entered info from the form using a FormData object
    const formData = new FormData(e.currentTarget);

    // Make sure data type === string for email and password
    const enteredEmail = String(formData.get("email") ?? "").trim();
    const enteredPassword = String(formData.get("password") ?? "");

    // Frontend validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(enteredEmail);

    if (!isValidEmail) {
      return;
    }

    // Frontend makes a "POST" request only when the provided info is accurate
    const signInRes = await fetch("/api/sign-in", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: enteredEmail,
        password: enteredPassword,
      }),
    });

    const data = await signInRes.json();

    // Sign in fail?
    // Y:
    if (!signInRes.ok) {
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
          const mergeRes = await fetch("/api/cart/merge", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              guestCart: parsedGuestCart,
            }),
          });

          // Merge fail?
          if (!mergeRes.ok) {
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
    router.push(safeRedirect);
  };

  return (
    <main>
      <form onSubmit={handleSignIn}>
        <div className={styles.signInContainer}>
          <div className={styles.inputContainer}>
            <div className={styles.formGroup}>
              <label htmlFor='email'>Email:</label>
              <input
                id='email'
                type='text'
                name='email'
                required
                autoComplete='email'
                onChange={(e) => setEmail(e.target.value)}
              ></input>
              {emailError && <p>{emailError}</p>}
              <label htmlFor='password'>Password:</label>
              <input
                id='password'
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
          <button type='submit' className={styles.signInButton}>
            Sign In
          </button>
          <div className={styles.signUpContainer}>
            <span>Don&apos;t have an account?</span>
            <Link
              href={redirect ? `/sign-up?redirect=${redirect}` : "/sign-up"}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </form>
    </main>
  );
}
