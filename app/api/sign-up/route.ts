import { NextResponse } from "next/server"; // Similar to res.json in Express
import db from "@/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json();

    // Backend validation:
    // Type validation: email, password => strings?
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        {
          message: "Invalid request",
        },
        {
          status: 400,
        },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

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

    // User already exists?
    const [existingUsers] = await db.query<RowDataPacket[]>(
      "SELECT user_id, email FROM users WHERE email = ?",
      [normalizedEmail],
    );

    // Y => Return error message
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

    // N:
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Add user info to DB
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO users (email, name, hashed_password) VALUES (?, ?, ?)",
      [normalizedEmail, name, hashedPassword],
    );

    // User successfully created?
    // N:
    if (result.affectedRows !== 1) {
      return NextResponse.json(
        { message: "Failed to create user" },
        { status: 500 },
      );
    }

    const userId = result.insertId;

    // Y:
    // Create sign-in session
    // JWT
    const token = jwt.sign(
      {
        userId,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      },
    );

    // Store JWT in cookies
    const cookieStore = await cookies();

    cookieStore.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

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
