import Link from "next/link";

export default function Page() {
  return (
    <main>
      <p>Order placed, thank you!</p>
      <p>Confirmation will be sent to your email.</p>
      <Link href='/'>Continue Shopping</Link>
    </main>
  );
}
