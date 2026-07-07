import getUserIdFromToken from "@/lib/auth";
import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";

export async function POST(request: Request) {
  try {
    // User sign in?
    const userId = await getUserIdFromToken();
    // N:
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Y => Get cart data from client
    const { cart } = await request.json();

    // Validate data type
    // Cart empty?
    // Y:
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    await createOrder(userId, cart);

    return NextResponse.json(
      { message: "Order successfully saved" },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error(err);

    if (err instanceof Error) {
      if (err.message === "INVALID_REQUEST") {
        return NextResponse.json(
          { message: "Invalid request" },
          { status: 400 },
        );
      }

      if (err.message === "NOT_ENOUGH_STOCK") {
        return NextResponse.json(
          { message: "Not enough stock" },
          { status: 400 },
        );
      }

      if (err.message === "STOCK_UPDATE_FAILED") {
        return NextResponse.json(
          { message: "Can't update stock quantity" },
          { status: 500 },
        );
      }

      if (err.message === "FAILED_TO_ADD_ORDER") {
        return NextResponse.json(
          { message: "Failed to add order to orders table" },
          { status: 500 },
        );
      }

      if (err.message === "FAILED_TO_ADD_ITEMS") {
        return NextResponse.json(
          { message: "Failed to add item to order_item table" },
          { status: 500 },
        );
      }

      if (err.message === "FAILED_TO_DELETE_CART_DATA") {
        return NextResponse.json(
          { message: "Failed to delete data from user's cart" },
          { status: 500 },
        );
      }
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
