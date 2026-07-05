import getUserIdFromToken from "@/lib/auth";
import { getCartData } from "@/lib/cart";
import CartClient from "./CartClient";

export default async function Page() {
  // Fetch cart data from DB: user's cart vs guest cart
  // User sign in?
  const userId = await getUserIdFromToken();
  const isSignIn = Boolean(userId);

  // Get cart data
  const initialCart = userId ? await getCartData(userId) : [];

  return (
    <CartClient initialCart={initialCart} isSignIn={isSignIn}></CartClient>
  );
}
