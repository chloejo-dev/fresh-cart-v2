import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// helper auth function to verify user's JWT
export default async function getUserIdFromToken() {
  try {
    // Get user's cookie and token
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token");

    // Token exists?
    // N:
    if (!token) {
      return null;
    }

    // Verify token
    const verifiedToken = jwt.verify(token.value, process.env.JWT_SECRET!);

    if (typeof verifiedToken !== "object" || verifiedToken === null) {
      return null;
    }

    const userId = verifiedToken.userId;

    if (typeof userId !== "number") {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}
