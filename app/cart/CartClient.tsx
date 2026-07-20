"use client";

import styles from "./page.module.css";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CartItem = {
  productId: number;
  productName: string;
  productPrice: number;
  productPic: string;
  productQuantity: number;
  categorySlug: string;
};

type CartProps = {
  initialCart: CartItem[];
  isSignIn: boolean;
};

export default function CartClient({ initialCart, isSignIn }: CartProps) {
  // Get initial cart from server component: [..] or []
  const [cartArr, setCartArr] = useState<CartItem[]>(initialCart);

  const router = useRouter();

  useEffect(() => {
    // User sign in?
    // Y:
    if (isSignIn) return;

    // Check guest cart
    try {
      // Guest cart exists?
      const guestCart = localStorage.getItem("cart"); // string or null

      // N:
      if (!guestCart) return; // early return if guest cart doesn't exist

      // Y:
      // Parse guest cart: Guest cart = [..] or []
      const parsedGuestCart = JSON.parse(guestCart);

      // Set guest cart as user's cart
      if (Array.isArray(parsedGuestCart)) {
        setCartArr(parsedGuestCart);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart");
    }
  }, [isSignIn]);

  // Increase current item quantity
  const increaseQty = async (id: number) => {
    // Find current item using product id
    const currentItem = cartArr.find((item) => item.productId === id);

    // Type narrowing: Make sure currentItem is not undefined
    if (!currentItem) return;

    // Calculate new quantity
    const newQuantity = currentItem.productQuantity + 1;

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
            productQuantity: newQuantity,
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

      if (!guestCart) return;

      // Find the current item index
      const parsedGuestCart: CartItem[] = JSON.parse(guestCart);
      const currentItemIndex = parsedGuestCart.findIndex(
        (item: CartItem) => item.productId === id,
      );

      // Error handling: Current item not found in guest cart
      if (currentItemIndex === -1) {
        return;
      }
      // Update with a new quantity
      parsedGuestCart[currentItemIndex].productQuantity = newQuantity;

      // Store updated guest cart in local storage
      localStorage.setItem("cart", JSON.stringify(parsedGuestCart));
    }
    // Frontend => rerender cart page
    setCartArr((prev) =>
      prev.map((item) =>
        item.productId === id
          ? {
              ...item,
              productQuantity: newQuantity,
            }
          : item,
      ),
    );
  };

  // Decrease current item quantity
  const decreaseQty = async (id: number) => {
    // Find current item using product id
    const currentItem = cartArr.find((item) => item.productId === id);

    // Type narrowing: Make sure currentItem is not undefined
    if (!currentItem) return;

    // User sign in?
    // Y:
    if (isSignIn) {
      try {
        // If currentItem quantity === 1, delete current item
        if (currentItem.productQuantity === 1) {
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
          setCartArr((prev) => prev.filter((item) => item.productId !== id));
          toast.success(data.message);
          return;
        }

        // If currentItem quantity > 1, adjust product quantity
        // Calculate new quantity
        const newQuantity = currentItem.productQuantity - 1;

        // Server-first change
        const res = await fetch(`/api/cart/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productQuantity: newQuantity,
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
            item.productId === id
              ? {
                  ...item,
                  productQuantity: newQuantity,
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

      if (!guestCart) return;

      const parsedGuestCart: CartItem[] = JSON.parse(guestCart);

      if (currentItem.productQuantity === 1) {
        // Delete current item
        const newGuestCart = parsedGuestCart.filter(
          (item: CartItem) => item.productId !== id,
        );
        // Store new guest cart in local storage
        localStorage.setItem("cart", JSON.stringify(newGuestCart));

        // Frontend => Delete current item and re-render cart page
        setCartArr((prev) => prev.filter((item) => item.productId !== id));
      } else {
        // Calculate new quantity
        const newQuantity = currentItem.productQuantity - 1;

        // Update guest cart with new quantity
        const currentItemIndex = parsedGuestCart.findIndex(
          (item: CartItem) => item.productId === id,
        );

        // Item not found
        if (currentItemIndex === -1) {
          return;
        }

        parsedGuestCart[currentItemIndex].productQuantity = newQuantity;

        // Store updated guest cart in local storage
        localStorage.setItem("cart", JSON.stringify(parsedGuestCart));

        // Frontend re-rendering
        setCartArr((prev) =>
          prev.map((item) =>
            item.productId === id
              ? {
                  ...item,
                  productQuantity: newQuantity,
                }
              : item,
          ),
        );
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
        setCartArr((prev) => prev.filter((item) => item.productId !== id));

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

      if (!guestCart) return;

      // Parse guest cart to access guest cart
      const parsedGuestCart: CartItem[] = JSON.parse(guestCart);

      // Delete current item from the cart
      const newGuestCart = parsedGuestCart.filter(
        (item: CartItem) => item.productId !== id,
      );
      // Store updated cart in local storage
      localStorage.setItem("cart", JSON.stringify(newGuestCart));

      // Frontend => Delete current item from guest cart
      setCartArr((prev) => prev.filter((item) => item.productId !== id));
    }
  };

  const handleCheckout = () => {
    // User sign in?
    // N: Redirect to sign in page
    if (!isSignIn) {
      // Checkout button -> sign-in page -> redirect to checkout page
      router.push("/sign-in?redirect=checkout");
      return;
    }

    // Y: Proceed with checkout
    router.push("/checkout");
  };

  const saveItems = () => {
    router.push("/saved-items");
  };

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
    (currenTotal, item) =>
      currenTotal + item.productPrice * item.productQuantity,
    0,
  );

  return (
    <main className={styles.cartPage}>
      <div className={styles.cartContainer}>
        <div>
          <h1>Shopping Cart</h1>
        </div>
        {cartArr.map((item) => (
          <div key={item.productId} className={styles.productRow}>
            <Image
              src={item.productPic}
              alt='product image'
              width={200}
              height={150}
              className={styles.productImage}
            ></Image>
            <div className={styles.productContainer}>
              <div className={styles.productInfoContainer}>
                <div className={styles.productDescContainer}>
                  <div>
                    <Link
                      href={`/products/${item.categorySlug}/${item.productId}`}
                      className={styles.productName}
                    >
                      {item.productName}
                    </Link>
                  </div>
                  <div className={styles.productPrice}>
                    <span>${item.productPrice}</span>
                  </div>
                </div>

                <div className={styles.buttonContainer}>
                  <div className={styles.quantityControls}>
                    <button
                      type='button'
                      onClick={() => decreaseQty(item.productId)}
                    >
                      {item.productQuantity === 1 ? <Trash2 /> : <Minus />}
                    </button>
                    <span>{item.productQuantity}</span>
                    <button
                      type='button'
                      onClick={() => increaseQty(item.productId)}
                    >
                      <Plus />
                    </button>
                  </div>
                  <div className={styles.actionButtons}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => deleteItem(item.productId)}
                      type='button'
                    >
                      Delete
                    </button>
                    <button
                      className={styles.saveButton}
                      onClick={saveItems}
                      type='button'
                    >
                      Save for Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.subtotalContainer}>
        <span className={styles.subtotalText}>
          Subtotal ({cartArr.length} {cartArr.length === 1 ? "item" : "items"}):
          ${subtotal.toFixed(2)}
        </span>
        <button
          className={styles.checkOutButton}
          onClick={handleCheckout}
          type='button'
        >
          Proceed to Check Out
        </button>
      </div>
    </main>
  );
}
