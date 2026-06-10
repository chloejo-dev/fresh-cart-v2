"use client";
import React, { useState } from "react";
import styles from "./page.module.css";

export default function Page() {
  const [username, setUserName] = useState<string>("");

  const handleSignUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData();

    console.log(form.get("username"));
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
            ></input>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor='confirmPassword'>Confirm your password:</label>
            <input
              id='confirmPassword'
              name='confirmPassword'
              type='password'
              required
              autoComplete='new-password'
            ></input>
          </div>
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
