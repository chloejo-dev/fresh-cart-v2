import { NextResponse } from "next/server";
import db from "@/lib/db";
import getUserIdFromToken from "@/lib/auth";
import { ResultSetHeader } from "mysql2";

export async function POST(request: Request) {
  try {
    // Get user input data from frontend
    const {
      recipientName,
      addressLine1,
      addressLine2,
      city,
      province,
      postalCode,
      phoneNumber,
    } = await request.json();

    // Validate user input
    // Type valid?
    // N:
    if (
      typeof recipientName !== "string" ||
      typeof addressLine1 !== "string" ||
      typeof addressLine2 !== "string" ||
      typeof city !== "string" ||
      typeof province !== "string" ||
      typeof postalCode !== "string" ||
      typeof phoneNumber !== "string"
    ) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const normalizedRecipientName = recipientName.trim();
    const normalizedAddressLine1 = addressLine1.trim();
    const normalizedAddressLine2 = addressLine2.trim();
    const normalizedCity = city.trim();
    const normalizedProvince = province.trim();

    // Business logic
    // Any of field empty excluding address2 (optional)?
    // N:
    if (
      normalizedRecipientName === "" ||
      normalizedAddressLine1 === "" ||
      normalizedCity === "" ||
      normalizedProvince === ""
    ) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // Length > 100?
    // N:
    if (
      normalizedRecipientName.length > 100 ||
      normalizedAddressLine1.length > 100 ||
      normalizedAddressLine2.length > 100 ||
      normalizedCity.length > 100 ||
      normalizedProvince.length > 100
    ) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const postalCodeRegex = /^[A-Z][0-9][A-Z][0-9][A-Z][0-9]$/;
    const phoneRegex = /^[2-9][0-9]{2}[2-9][0-9]{2}[0-9]{4}$/;

    // Normalize postal code
    const normalizedPostalCode = postalCode.replace(/\s/g, "").toUpperCase();

    // Postal code & phone number valid?
    // N:
    if (
      !postalCodeRegex.test(normalizedPostalCode) ||
      !phoneRegex.test(phoneNumber.trim())
    ) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    // Normalize phone number
    const normalizedPhoneNumber = phoneNumber.replace(/\D/g, "");

    // User sign in?
    // N:
    const userId = Number(await getUserIdFromToken());

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Y => Store current address in DB (addresses)
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO addresses
      (user_id,
      recipient_name,
      phone,
      address_line1,
      address_line2,
      city,
      province,
      postal_code)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        normalizedRecipientName,
        normalizedPhoneNumber,
        normalizedAddressLine1,
        normalizedAddressLine2,
        normalizedCity,
        normalizedProvince,
        normalizedPostalCode,
      ],
    );

    // DB store success?
    // N:
    if (result.affectedRows !== 1) {
      return NextResponse.json(
        { message: "Failed to add address" },
        { status: 500 },
      );
    }
    // Y:
    return NextResponse.json(
      { message: "Address successfully added to DB" },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { message: "POST /api/addresses failed" },
      { status: 500 },
    );
  }
}
