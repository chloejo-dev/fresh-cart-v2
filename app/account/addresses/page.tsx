"use client";
import { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function Page() {
  const [recipientName, setRecipientName] = useState<string>("");
  const [addressLine1, setAddressLine1] = useState<string>("");
  const [addressLine2, setAddressLine2] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const provinces = [
    "AB",
    "BC",
    "MB",
    "NB",
    "NL",
    "NS",
    "NT",
    "NU",
    "ON",
    "PE",
    "QC",
    "SK",
    "YT",
  ];
  // Address form
  return (
    <main className={styles.addressPage}>
      <form className={styles.formContainer}>
        <div className={styles.inputContainer}>
          <div className={styles.formGroup}>
            <p>*Required field</p>
            <label htmlFor='recipientName'>Name*</label>
            <input
              id='recipientName'
              value={recipientName}
              name='recipientName'
              required
              type='text'
              autoComplete='name'
              onChange={(e) => setRecipientName(e.target.value)}
            ></input>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor='addressLine1'>Street address*</label>
            <input
              id='addressLine1'
              value={addressLine1}
              name='addressLine1'
              required
              type='text'
              autoComplete='address-line1'
              onChange={(e) => setAddressLine1(e.target.value)}
            ></input>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor='addressLine2'>Apt, suite, etc</label>
            <input
              id='addressLine2'
              value={addressLine2}
              name='addressLine2'
              autoComplete='address-line2'
              onChange={(e) => setAddressLine2(e.target.value)}
            ></input>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor='city'>City*</label>
            <input
              id='city'
              value={city}
              name='city'
              required
              autoComplete='address-level2'
              onChange={(e) => setCity(e.target.value)}
            ></input>
          </div>
          <div className={styles.addressGroup}>
            <div className={styles.provinceGroup}>
              <label htmlFor='province'>Province/Territory*</label>
              <select
                id='province'
                name='province'
                value={province}
                required
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value='' disabled>
                  Province/Territory
                </option>
                {provinces.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.postalCodeGroup}>
              <label htmlFor='postalCode'>Postal Code*</label>
              <input
                id='postalCode'
                value={postalCode}
                name='postalCode'
                required
                type='text'
                autoComplete='postal-code'
                onChange={(e) => setPostalCode(e.target.value)}
              ></input>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor='phone'>Phone Number*</label>
            <input
              id='phone'
              value={phone}
              name='phone'
              required
              type='tel'
              autoComplete='tel'
              onChange={(e) => setPhone(e.target.value)}
            ></input>
          </div>
          <div className={styles.buttonContainer}>
            <Link href='/account' className={styles.cancelButton}>
              Cancel
            </Link>
            <button type='submit' className={styles.saveButton}>
              Save
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
