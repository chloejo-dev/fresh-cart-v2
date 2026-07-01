"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { redirectMap } from "@/lib/redirect";

export default function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState("");

  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  // Validate redirect route
  const safeRedirect =
    redirect && redirect in redirectMap
      ? redirectMap[redirect as keyof typeof redirectMap]
      : "/";

  let emailError = "";
  let inputPasswordError = "";
  let reEnteredPasswordError = "";

  const router = useRouter();

  // Real-time validation(email, password, confirmPassword)
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email);
  if (email.length > 0 && !isValidEmail) {
    emailError = "Please enter a valid email address";
  }

  // Password validation logic => derived state by using useState const variables
  const hasSpecialCharacter = /[!@#$%^&*]/.test(password);

  if (password.length > 0) {
    // Password s/b at least 10 characters
    if (password.length < 10) {
      inputPasswordError = "Password should be at least 10 characters";
      // Password should contain at least one special character  e.g. #, %, $...
    } else if (!hasSpecialCharacter) {
      inputPasswordError =
        "Password should include at least one special character(e.g. #, $, %...)";
    }
  }
  // confirmPassword === password
  if (confirmPassword.length > 0 && confirmPassword !== password) {
    reEnteredPasswordError = "Password do not match";
  }

  // Handle sign up when user click 'Submit'
  const handleSignUp: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setSubmitError("");

    // Get user entered information from sign up form
    const formData = new FormData(e.currentTarget);

    // Make sure below info data type is string: "" vs. "value"
    const enteredEmail = String(formData.get("email") ?? "").trim();
    const enteredPassword = String(formData.get("password") ?? "");
    const enteredConfirmPassword = String(
      formData.get("confirmPassword") ?? "",
    );

    // Required attribute: Catch empty fields and doesn't allow submit to be clicked

    // Frontend validation to stop making a POST request
    // Email validation
    if (!emailRegex.test(enteredEmail)) {
      return;
    }

    // password & confirmPassword
    // password length < 10?
    if (enteredPassword.length < 10) {
      return;
    }
    // password has a special character?
    if (!/[!@#$%^&*]/.test(enteredPassword)) {
      return;
    }
    // password === confirmPassword?
    if (enteredPassword !== enteredConfirmPassword) {
      return;
    }

    // Make a POST request to backend with user information
    const signUpRes = await fetch("/api/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: enteredEmail,
        name,
        password: enteredPassword,
      }),
    });

    // Get response from server
    const data = await signUpRes.json();

    // Error handling
    if (!signUpRes.ok) {
      setSubmitError(data.message);
      return;
    }

    // Guest cart exists?
    // Y: Get guest cart data from local storage
    const guestCart = localStorage.getItem("cart");

    if (guestCart) {
      try {
        const parsedGuestCart = JSON.parse(guestCart);
        // Make sure guest cart is not empty
        if (Array.isArray(parsedGuestCart) && parsedGuestCart.length > 0) {
          // Send it to cart/merge API
          const mergeRes = await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guestCart: parsedGuestCart }),
          });
          if (mergeRes.ok) {
            localStorage.removeItem("cart");
          } else {
            console.error("Failed to merge guest cart");
          }
        }
      } catch (err: unknown) {
        console.error(err);
      }
    }

    // Redirect page after sign-up
    router.push(safeRedirect);
  };

  return (
    <main>
      <form className={styles.formContainer} onSubmit={handleSignUp}>
        <div className={styles.inputContainer}>
          <div className={styles.formGroup}>
            <label htmlFor='name'>Enter your name:</label>
            <input
              id='name'
              value={name}
              name='name'
              required
              autoComplete='name'
              onChange={(e) => setName(e.target.value)}
            ></input>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor='email'>Enter email address:</label>
            <input
              id='email'
              name='email'
              type='email'
              required
              autoComplete='email'
              onChange={(e) => setEmail(e.target.value)}
            ></input>
          </div>
          {emailError && <p>{emailError}</p>}
          <div className={styles.formGroup}>
            <label htmlFor='password'>Enter password:</label>
            <input
              id='password'
              value={password}
              name='password'
              type='password'
              required
              autoComplete='new-password'
              onChange={(e) => setPassword(e.target.value)}
            ></input>
          </div>
          {inputPasswordError && <p>{inputPasswordError}</p>}
          <div className={styles.formGroup}>
            <label htmlFor='confirmPassword'>Confirm your password:</label>
            <input
              id='confirmPassword'
              value={confirmPassword}
              name='confirmPassword'
              type='password'
              required
              autoComplete='new-password'
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></input>
          </div>
          {reEnteredPasswordError && <p>{reEnteredPasswordError}</p>}
        </div>
        <div className={styles.buttonContainer}>
          <button type='submit' className={styles.submitButton}>
            Submit
          </button>
        </div>
        {submitError && <p>{submitError}</p>}
      </form>
    </main>
  );
}
