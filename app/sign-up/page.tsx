"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { redirectMap } from "@/lib/redirect";

export default function Page() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");

  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  // Validate redirect route
  const safeRedirect =
    redirect && redirect in redirectMap
      ? redirectMap[redirect as keyof typeof redirectMap]
      : "/";

  let inputPasswordError = "";
  let reEnteredPasswordError = "";
  let usernameError = "";

  const router = useRouter();

  // Real-time validation(username, password, confirmPassword)
  // Username validation: Spaces not allowed in username
  if (username.includes(" ")) {
    usernameError = "Username cannot contain spaces";
  } else if (username.length > 0 && username.length < 5) {
    usernameError = "Username should be at least 5 characters";
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
    const enteredUsername = String(formData.get("username") ?? "").trim();
    const enteredEmail = String(formData.get("email") ?? "").trim();
    const enteredPassword = String(formData.get("password") ?? "");
    const enteredConfirmPassword = String(
      formData.get("confirmPassword") ?? "",
    );

    // Required attribute: Catch empty fields and doesn't allow submit to be clicked

    // Frontend validation to stop making a POST request
    // username has spaces?
    if (enteredUsername.includes(" ")) {
      return; // stop the function
    }

    // enteredUsername.length > 0 is prevented by "required" attribute
    // username length < 5?
    if (enteredUsername.length < 5) {
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
    const res = await fetch("/api/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: enteredUsername,
        email: enteredEmail,
        password: enteredPassword,
      }),
    });

    // Get response from server
    const data = await res.json();

    // Error handling
    if (!res.ok) {
      setSubmitError(data.message);
      return;
    }

    
    // Redirect page after sign-up
    router.push(safeRedirect);
  };

  return (
    <main>
      <form className={styles.formContainer} onSubmit={handleSignUp}>
        <div className={styles.inputContainer}>
          <div className={styles.formGroup}>
            <label htmlFor='username'>Enter username:</label>
            <input
              id='username'
              value={username}
              name='username'
              required
              autoComplete='username'
              onChange={(e) => setUsername(e.target.value)}
            ></input>
          </div>
          {usernameError && <p>{usernameError}</p>}
          <div className={styles.formGroup}>
            <label htmlFor='email'>Enter email address:</label>
            <input
              id='email'
              name='email'
              type='email'
              required
              autoComplete='email'
            ></input>
          </div>
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
          <button type='submit' className={styles.submitBtn}>
            Submit
          </button>
        </div>
        {submitError && <p>{submitError}</p>}
      </form>
    </main>
  );
}
