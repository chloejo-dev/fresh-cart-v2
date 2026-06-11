"use client";
import React, { useState } from "react";
import styles from "./page.module.css";

export default function Page() {
  const [password, setPassword] = useState<string>("");
  const [rePassword, setRePassword] = useState<string>("");
  let inputPasswordError = "";
  let reEnteredPasswordError = "";

  console.log("Browser: ", password, rePassword);

  const hasSpecialCharacter = /[!@#$%^&*]/.test(password);
  // Password validation logic => derived state
  // Password s/b at least 10 characters
  // Password should include one special characters e.g. #, %, $...
  if (password.length > 0) {
    if (password.length < 10) {
      inputPasswordError = "Password should be at least 10 characters";
    } else if (!hasSpecialCharacter) {
      inputPasswordError =
        "Password should include at least one special character(e.g. #, $, %...)";
    }

    if (rePassword.length > 0 && rePassword !== password) {
      reEnteredPasswordError = "Password not match";
    }
  }

  const handleSignUp: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    // Get user entered information from sign up form
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
  };

  return (
    <main>
      <form className={styles.formContainer} onSubmit={handleSignUp}>
        <div className={styles.inputContainer}>
          <div className={styles.formGroup}>
            <label htmlFor='username'>Enter username:</label>
            <input
              id='username'
              name='username'
              required
              autoComplete='username'
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
            ></input>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor='password'>Enter password:</label>
            <input
              id='password'
              name='password'
              type='password'
              required
              autoComplete='new-password'
              onChange={(e) => setPassword(e.target.value)}
            ></input>
          </div>
          {inputPasswordError ? <p>{inputPasswordError}</p> : <p></p>}
          <div className={styles.formGroup}>
            <label htmlFor='confirmPassword'>Confirm your password:</label>
            <input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              required
              autoComplete='new-password'
              onChange={(e) => setRePassword(e.target.value)}
            ></input>
          </div>
          {reEnteredPasswordError ? <p>{reEnteredPasswordError}</p> : <p></p>}
        </div>
        <div className={styles.buttonContainer}>
          <button type='submit' className={styles.submitBtn}>
            Submit
          </button>
        </div>
      </form>
    </main>
  );
}
