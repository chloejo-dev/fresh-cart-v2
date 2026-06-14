import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    // Backend validation:
    // Type validation: username, email, password are strings?
    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          message: "Invalid request",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Username validation
    if (normalizedUsername.includes(" ")) {
      return NextResponse.json(
        {
          message: "Username cannot contain spaces",
        },
        {
          status: 400,
        },
      );
    }
    if (normalizedUsername.length < 5) {
      return NextResponse.json(
        {
          message: "Username should be at least 5 characters",
        },
        {
          status: 400,
        },
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        {
          message: "Invalid email address",
        },
        {
          status: 400,
        },
      );
    }

    // Password validation
    if (password.length < 10) {
      return NextResponse.json(
        {
          message: "Password should be at least 10 characters",
        },
        {
          status: 400,
        },
      );
    }

    if (!/[!@#$%^&*]/.test(password)) {
      return NextResponse.json(
        {
          message:
            "Password should include at least one special character(e.g. #, $, %...)",
        },
        {
          status: 400,
        },
      );
    }

    // Check if username is already in users table using the info received from frontend
    // Yes, send back error message
    const [existingUsers] = await db.query<RowDataPacket[]>(
      "SELECT user_id, username FROM users WHERE username = ?",
      [normalizedUsername],
    );

    // If username is in users table, inform frontend
    if (existingUsers.length > 0) {
      return NextResponse.json(
        {
          message: "User already exists",
        },
        {
          status: 409,
        },
      );
    }

    // No, add the user info to DB
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO users (username, email, hashed_password) VALUES (?, ?, ?)",
      [normalizedUsername, normalizedEmail, hashedPassword],
    );

    if (result.affectedRows !== 1) {
      return NextResponse.json(
        { message: "Failed to create user" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "User successfully created",
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    if (
      // Prevent duplicate users
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "ER_DUP_ENTRY"
    ) {
      return NextResponse.json(
        {
          message: "User already exists",
        },
        { status: 409 },
      );
    } else {
      console.error("POST /api/sign-up failed:", err);
    }

    return NextResponse.json(
      {
        message: "Failed to add the user",
      },
      { status: 500 },
    );
  }
}
