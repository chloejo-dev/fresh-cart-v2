"use client";
import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type CartItem = {
  productId: string;
  productPic: string;
  productName: string;
  productPrice: number;
  quantity: number;
};

type CheckoutInfo = {
  user: {
    recipientName: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    province: string;
    postalCode: string;
    phoneNumber: string;
    country: string;
  };
  cart: CartItem[];
};

export default function Page() {
  const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const getCheckoutInfo = async () => {
      try {
        const res = await fetch("/api/checkout");

        // User sign in?
        // N: Redirect to sign-in page
        if (res.status === 401) {
          router.push("/sign-in?redirect=checkout");
          return;
        }

        const data = await res.json();

        // Error handling
        if (!res.ok) {
          toast.error(data.message);
          return;
        }
        setCheckoutInfo(data);
      } catch (err: unknown) {
        console.error(err);
      }
    };

    getCheckoutInfo();
  }, [router]);

  const handleOrder = async () => {
    // User submit order?
    // Y => Do not allow another submission
    if (isSubmitting) return;

    // N:
    setIsSubmitting(true);

    try {
      // Make a POST request
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      // Add order success?
      // N:
      if (!res.ok) {
        console.error("Failed to save order");
        return;
      }
      // Y:
      router.push("/order-success");
    } catch (err: unknown) {
      console.error(err);
    }
  };

  if (!checkoutInfo) {
    return <p>Loading...</p>;
  }

  const { user, cart } = checkoutInfo;

  const increaseQty = (productId: string) => {
    setCheckoutInfo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cart: prev.cart.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      };
    });
  };

  const decreaseQty = (productId: string) => {
    setCheckoutInfo((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        cart: prev.cart.map((item) => {
          if (item.productId === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        }),
      };
    });
  };

  const deleteItem = async (productId: string) => {
    // Delete item from cart DB
    try {
      // Frontend => Request backend to delete product
      const res = await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      // Re-rendering
      setCheckoutInfo((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          cart: prev.cart.filter((item) => item.productId !== productId),
        };
      });

      // Print delete success message
      toast.success(data.message);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to delete product");
      return;
    }
  };

  // Calculate total # of items
  const totalNumOfItems = cart.reduce(
    (currentTotal, item) => currentTotal + item.quantity,
    0,
  );

  // Calculate subtotal
  const subtotal = cart.reduce(
    (currentTotal, item) => currentTotal + item.productPrice * item.quantity,
    0,
  );

  const shippingFee = 0.0;

  // Calculate tax
  const totalTax = subtotal * 0.15;

  // Calculate total amount
  const orderTotal = subtotal + shippingFee + totalTax;

  return (
    <main className={styles.checkoutPage}>
      <section className={styles.orderDetails}>
        <h1>Review order</h1>
        <div className={styles.shippingAddress}>
          <h2>Delivering to {user.recipientName}</h2>
          <p>
            {user.addressLine1}
            {user.addressLine2 && `, ${user.addressLine2}`}, {user.city},{" "}
            {user.postalCode}, {user.province}, {user.country}
          </p>
        </div>
        <div className={styles.orderItems}>
          {cart.map((item) => (
            <div key={item.productId} className={styles.orderItemRow}>
              <Image
                src={item.productPic}
                alt={item.productName}
                width={100}
                height={120}
                className={styles.productImage}
              ></Image>
              <p className={styles.productName}>{item.productName}</p>
              <p className={styles.productPrice}>${item.productPrice}</p>
              <div className={styles.quantityControls}>
                <button
                  type='button'
                  onClick={() => {
                    if (item.quantity === 1) {
                      deleteItem(item.productId);
                    } else {
                      decreaseQty(item.productId);
                    }
                  }}
                >
                  {item.quantity === 1 ? <Trash2 /> : <Minus />}
                </button>
                <p>{item.quantity}</p>
                <button
                  type='button'
                  onClick={() => increaseQty(item.productId)}
                >
                  <Plus />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.paymentMethod}>
          <h2>Paying with 1234</h2>
          <Link href='/change'>Change</Link>
        </div>
        <div className={styles.deliveryInfo}>
          <h2>Arriving Jun 29, 2026</h2>
        </div>
      </section>
      <section className={styles.orderSummary}>
        <button
          className={styles.orderButton}
          onClick={handleOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Placing Order..." : "Place Your Order"}
        </button>
        <div className={styles.orderSummaryDetails}>
          <p>
            Items ({totalNumOfItems}): ${subtotal.toFixed(2)}
          </p>
          <p>Shipping & Handling: ${shippingFee.toFixed(2)}</p>
          <p>Estimated GST/HST: ${totalTax.toFixed(2)}</p>
          <h3>Order Total: ${orderTotal.toFixed(2)}</h3>
        </div>
      </section>
    </main>
  );
}
