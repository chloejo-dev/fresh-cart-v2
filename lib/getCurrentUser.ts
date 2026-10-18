import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";
import getUserIdFromToken from "@/lib/auth";

export async function getCurrentUser() {
  const userId = await getUserIdFromToken();

  if (userId === null) return null;

  // Look up current user in the database
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT 
      users.email,
      users.joined_date AS joinedDate,
      addresses.address_line1 AS addressLine1
      FROM users
      LEFT JOIN addresses
      ON users.user_id = addresses.user_id
      WHERE users.user_id = ?`,
    [userId],
  );

  if (rows.length === 0) return null;
  return rows[0];
}
