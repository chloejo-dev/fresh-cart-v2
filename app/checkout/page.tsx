import getUserIdFromToken from "@/lib/auth";
import { redirect } from "next/navigation";
import getCheckoutInfo from "@/lib/checkout";
import CheckoutClient from "./CheckoutClient";

export default async function Page() {
  // User sign in?
  const userId = await getUserIdFromToken();

  // N: Redirect to sign in page
  if (!userId) {
    redirect("/sign-in?redirect=/checkout");
  }

  // Check checkout info: user, cart
  const initialCheckoutInfo = await getCheckoutInfo(userId);

  if (!initialCheckoutInfo.user) {
    redirect("/account/addresses?redirect=/checkout");
  }

  if (initialCheckoutInfo.cart.length === 0) {
    redirect("/cart");
  }

  return (
    <CheckoutClient initialCheckoutInfo={initialCheckoutInfo}></CheckoutClient>
  );
}
