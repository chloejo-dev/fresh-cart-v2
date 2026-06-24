"use client";

import styles from "./page.module.css";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
interface CartItem {
  product_name: string;
  product_id: number;
  product_price: number;
  product_pic: string;
  quantity: number;
}

export default function Page() {
  const [cartArr, setCartArr] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSignIn, setIsSignIn] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const res = await fetch("/api/cart");
        const data = await res.json();
        // User sign in?
        // N: Guest
        if (res.status === 401) {
          // Cart exists in local storage?
          const guestCart = localStorage.getItem("cart");

          if (guestCart) {
            setCartArr(JSON.parse(guestCart));
          }

          setIsSignIn(false);
          return;
        }
        // Other error handling
        if (!res.ok) {
          toast.error(data.message);
          return;
        }
        // Y: Store user's cart data
        setCartArr(data);
        setIsSignIn(true);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load cart");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  // Increase current item quantity
  const increaseQty = async (id: number) => {
    // Find product current item using id
    const currentItem = cartArr.find((item) => item.product_id === id);

    // Type narrowing: Make sure currentItem is not undefined
    if (!currentItem) return;

    // Calculate new quantity
    const newQuantity = currentItem.quantity + 1;

    // User sign in?
    // Y:
    if (isSignIn) {
      try {
        // Ask server to update quantity => Server-first change
        const res = await fetch(`/api/cart/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: newQuantity,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          toast.error(data.message);
          return;
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to update quantity");
        return;
      }
    } else {
      // N: Update guest cart
      // Fetch existing guest cart
      const guestCart = localStorage.getItem("cart");
      // Find the current item index
      if (guestCart) {
        const parsedGuestCart: CartItem[] = JSON.parse(guestCart);
        const currentItemIndex = parsedGuestCart.findIndex(
          (item: CartItem) => item.product_id === id,
        );

        // Error handling: Current item not in guest cart
        if (currentItemIndex === -1) {
          return;
        }
        // Update with a new quantity
        parsedGuestCart[currentItemIndex].quantity = newQuantity;
        // Store updated guest cart in local storage
        localStorage.setItem("cart", JSON.stringify(parsedGuestCart));
      }
    }
    // Frontend => rerender cart page
    setCartArr((prev) =>
      prev.map((item) =>
        item.product_id === id
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item,
      ),
    );
  };

  // Decrease current item quantity
  const decreaseQty = async (id: number) => {
    // Find current item using id
    const currentItem = cartArr.find((item) => item.product_id === id);

    // Type narrowing: Make sure currentItem is not undefined
    if (!currentItem) return;

    // User sign in?
    // Y:
    if (isSignIn) {
      try {
        // If currentItem quantity === 1, delete current item
        if (currentItem.quantity === 1) {
          // Server-first change
          const res = await fetch(`/api/cart/${id}`, {
            method: "DELETE",
          });

          const data = await res.json();

          if (!res.ok) {
            toast.error(data.message);
            return;
          }

          // Frontend => delete current item and rerender cart page
          setCartArr((prev) => prev.filter((item) => item.product_id !== id));
          toast.success(data.message);
          return;
        }

        // If currentItem quantity > 1, adjust product quantity
        // Calculate new quantity
        const newQuantity = currentItem.quantity - 1;

        // Server-first change
        const res = await fetch(`/api/cart/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: newQuantity,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message);
          return;
        }

        // Frontend => Update quantity and re-render cart page
        setCartArr((prev) =>
          prev.map((item) =>
            item.product_id === id
              ? {
                  ...item,
                  quantity: newQuantity,
                }
              : item,
          ),
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to update quantity");
        return;
      }
    } else {
      // N:
      // Get guest cart from local storage
      const guestCart = localStorage.getItem("cart");

      if (guestCart) {
        const parsedGuestCart: CartItem[] = JSON.parse(guestCart);
        if (currentItem.quantity === 1) {
          // Delete current item
          const newGuestCart = parsedGuestCart.filter(
            (item: CartItem) => item.product_id !== id,
          );
          // Store new guest cart in local storage
          localStorage.setItem("cart", JSON.stringify(newGuestCart));

          // Frontend => Delete current item and re-render cart page
          setCartArr((prev) => prev.filter((item) => item.product_id !== id));
        } else {
          // Calculate new quantity
          const newQuantity = currentItem.quantity - 1;

          // Update guest cart with new quantity
          const currentItemIndex = parsedGuestCart.findIndex(
            (item: CartItem) => item.product_id === id,
          );

          if (currentItemIndex === -1) {
            return;
          }

          parsedGuestCart[currentItemIndex].quantity = newQuantity;

          // Store updated guest cart in local storage
          localStorage.setItem("cart", JSON.stringify(parsedGuestCart));
          // Frontend re-rendering
          setCartArr((prev) =>
            prev.map((item) =>
              item.product_id === id
                ? {
                    ...item,
                    quantity: newQuantity,
                  }
                : item,
            ),
          );
        }
      }
    }
  };

  // Delete current item when user click 'Delete' button
  const deleteItem = async (id: number) => {
    // User sign in?
    // Y:
    if (isSignIn) {
      try {
        // Frontend => Request backend to delete product
        const res = await fetch(`/api/cart/${id}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message);
          return;
        }

        // Frontend => Delete current item from user's cart
        setCartArr((prev) => prev.filter((item) => item.product_id !== id));

        // Print delete success message
        toast.success(data.message);
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete product");
        return;
      }
    } else {
      // N:
      // Get guest cart from local storage
      const guestCart = localStorage.getItem("cart");
      // Parse guest cart to access guest cart
      if (guestCart) {
        const parsedGuestCart: CartItem[] = JSON.parse(guestCart);

        // Delete current item from the cart
        const newGuestCart = parsedGuestCart.filter(
          (item: CartItem) => item.product_id !== id,
        );
        // Store updated cart in local storage
        localStorage.setItem("cart", JSON.stringify(newGuestCart));
      }

      // Frontend => Delete current item from guest cart
      setCartArr((prev) => prev.filter((item) => item.product_id !== id));
    }
  };

  const handleCheckOut = () => {
    console.log("User sign in? ", isSignIn);
    // User sign in?
    // N: Redirect to sign in page
    if (!isSignIn) {
      // Checkout button -> sign-in page -> redirect to checkout page
      router.push("/sign-in?redirect=/checkout");
    }

    // Y: Proceed with checkout
  };

  // Cart loading?
  if (isLoading) {
    return (
      <main className={styles.centeredPage}>
        <p className={styles.loadingMessage}>Loading Cart...</p>
      </main>
    );
  }
  // User has no items in their cart
  if (cartArr.length === 0) {
    return (
      <main className={styles.centeredPage}>
        <p className={styles.emptyCartMessage}>Your cart is empty!</p>
      </main>
    );
  }

  // Iterate over cart array and calculate subtotal
  const subtotal = cartArr.reduce(
    (currenTotal, item) => currenTotal + item.product_price * item.quantity,
    0,
  );

  return (
    <main className={styles.cartPage}>
      <div className={styles.cartContainer}>
        {cartArr.map((item) => (
          <div key={item.product_id} className={styles.productRow}>
            <Image
              src={item.product_pic}
              alt='product image'
              width={200}
              height={150}
            ></Image>
            <div className={styles.productContainer}>
              <div className={styles.productInfoContainer}>
                <div className={styles.productDescContainer}>
                  <div className={styles.productTitle}>
                    <span>{item.product_name}</span>
                  </div>
                  <div className={styles.productPrice}>
                    <span>${item.product_price}</span>
                  </div>
                </div>

                <div className={styles.btnContainer}>
                  <button
                    type='button'
                    onClick={() => decreaseQty(item.product_id)}
                  >
                    {item.quantity === 1 ? <Trash2 /> : <Minus />}
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type='button'
                    onClick={() => increaseQty(item.product_id)}
                  >
                    <Plus />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteItem(item.product_id)}
                  >
                    Delete
                  </button>
                  <button className={styles.saveBtn}>Save for later</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.subtotalContainer}>
        <span className={styles.subtotalText}>
          Subtotal: ${subtotal.toFixed(2)}
        </span>
        <button className={styles.checkOutButton} onClick={handleCheckOut}>
          Proceed to Check Out
        </button>
      </div>
    </main>
  );
}
