"use client";
import React, { useState } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { redirectMap } from "@/lib/redirect";

type AddressFormErrors = {
  recipientName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  phoneNumber?: string;
  form?: string;
};

export default function Page() {
  const [recipientName, setRecipientName] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<AddressFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  // Validate redirect route
  const safeRedirect =
    redirect && redirect in redirectMap
      ? redirectMap[redirect as keyof typeof redirectMap]
      : "/account";

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // Prevent multiple submission at once
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Frontend => validate all user input
    // Normalize input first
    const normalizedRecipientName = recipientName.trim();
    const normalizedAddressLine1 = addressLine1.trim();
    const normalizedAddressLine2 = addressLine2.trim();
    const normalizedCity = city.trim();

    const postalCodeRegex = /^[A-Z][0-9][A-Z][0-9][A-Z][0-9]$/;
    const phoneRegex =
      /^(?:\+1[-.\s]?)?(?:\([2-9][0-9]{2}\)|[2-9][0-9]{2})[-.\s]?[2-9][0-9]{2}[-.\s]?[0-9]{4}$/;

    // Display error for UX
    const addressFormErrors: AddressFormErrors = {};

    // Recipient name
    if (normalizedRecipientName === "")
      addressFormErrors.recipientName = "Recipient name is required";

    if (normalizedRecipientName.length > 100)
      addressFormErrors.recipientName =
        "Recipient name cannot exceed 100 characters";

    // Address
    if (normalizedAddressLine1 === "")
      addressFormErrors.addressLine1 = "Address is required";

    if (normalizedAddressLine1.length > 100)
      addressFormErrors.addressLine1 = "Address cannot exceed 100 characters";

    if (normalizedAddressLine2.length > 100) {
      addressFormErrors.addressLine2 =
        "Address line 2 cannot exceed 100 characters";
    }

    // City
    if (normalizedCity === "") addressFormErrors.city = "City is required";
    if (normalizedCity.length > 100)
      addressFormErrors.city = "City cannot exceed 100 characters";

    if (province === "") {
      addressFormErrors.province = "Province/Territory is required";
    }

    // postal code(letter + number + letter + number + letter + number)
    const normalizedPostalCode = postalCode.replace(/\s/g, "").toUpperCase();
    // Postal code
    if (normalizedPostalCode === "") {
      addressFormErrors.postalCode = "Postal code is required";
    } else if (!postalCodeRegex.test(normalizedPostalCode)) {
      addressFormErrors.postalCode = "Please enter a valid postal code";
    }

    // Phone number => Validate first
    if (!phoneRegex.test(phoneNumber.trim()))
      addressFormErrors.phoneNumber = "Please enter a valid phone number";

    setErrors(addressFormErrors);

    // Frontend => Validate user input
    if (Object.keys(addressFormErrors).length > 0) {
      setIsSubmitting(false);
      return;
    }

    // Normalize phone number
    const normalizedPhoneNumber = phoneNumber.replace(/\D/g, "");

    try {
      // Make HTTP request only when all user input is valid
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: normalizedRecipientName,
          addressLine1: normalizedAddressLine1,
          addressLine2: normalizedAddressLine2,
          city: normalizedCity,
          province,
          postalCode: normalizedPostalCode,
          phoneNumber: normalizedPhoneNumber,
        }),
      });

      const data = await res.json();

      // Adding address success?
      // N:
      if (!res.ok) {
        setErrors({ form: data.message });
        return;
      }

      // Y:
      router.push(safeRedirect);
    } catch (err: unknown) {
      console.error(err);
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Address form
  return (
    <main className={styles.addressPage}>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
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
              maxLength={100}
              autoComplete='name'
              onChange={(e) => setRecipientName(e.target.value)}
            ></input>
          </div>
          {errors.recipientName && <p>{errors.recipientName}</p>}
          <div className={styles.formGroup}>
            <label htmlFor='addressLine1'>Street address*</label>
            <input
              id='addressLine1'
              value={addressLine1}
              name='addressLine1'
              required
              type='text'
              maxLength={100}
              autoComplete='address-line1'
              onChange={(e) => setAddressLine1(e.target.value)}
            ></input>
          </div>
          {errors.addressLine1 && <p>{errors.addressLine1}</p>}
          <div className={styles.formGroup}>
            <label htmlFor='addressLine2'>Apt, suite, etc</label>
            <input
              id='addressLine2'
              value={addressLine2}
              name='addressLine2'
              maxLength={100}
              autoComplete='address-line2'
              onChange={(e) => setAddressLine2(e.target.value)}
            ></input>
          </div>
          {errors.addressLine2 && <p>{errors.addressLine2}</p>}
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
          {errors.city && <p>{errors.city}</p>}
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
            {errors.province && <p>{errors.province}</p>}
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
            {errors.postalCode && <p>{errors.postalCode}</p>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor='phone'>Phone Number*</label>
            <input
              id='phone'
              value={phoneNumber}
              name='phone'
              required
              type='tel'
              autoComplete='tel'
              onChange={(e) => setPhoneNumber(e.target.value)}
            ></input>
          </div>
          {errors.phoneNumber && <p>{errors.phoneNumber}</p>}
          <div className={styles.buttonContainer}>
            <Link href='/account' className={styles.cancelButton}>
              Cancel
            </Link>
            {errors.form && <p>{errors.form}</p>}
            <button
              type='submit'
              className={styles.saveButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
