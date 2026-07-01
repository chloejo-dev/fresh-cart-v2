import getUserIdFromToken from "@/lib/auth";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextResponse } from "next/server";
import db from "@/lib/db";

type ValidRow = RowDataPacket & {
  userId: number;
  productId: number;
  productName: string;
  productPic: string;
  productPrice: number;
  stockQuantity: number;
};

// Data type to store data sent from client
type OrderItem = {
  productId: number;
  productName: string;
  productPic: string;
  productPrice: number;
  quantity: number;
};

export async function POST(request: Request) {
  // Create connection to handle transaction
  const connection = await db.getConnection();
  // Track if transaction start
  let transactionStarted = false;

  try {
    // User sign in? (user validation)
    const userId = await getUserIdFromToken();
    // N:
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Y:
    const { cart } = await request.json();

    // Validate data type
    // Cart empty?
    if (!Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    // Start transaction
    await connection.beginTransaction();
    transactionStarted = true;

    let subtotal = 0.0;
    const shippingFee = 0.0;
    const orderItems: OrderItem[] = [];

    for (const item of cart) {
      // User has current item in user's cart?
      const [rows] = await connection.query<ValidRow[]>(
        `SELECT
        cart.user_id as userId,
        cart.product_id as productId,
        products.product_name as productName,
        products.product_pic as productPic,
        products.product_price as productPrice,
        products.stock_quantity as stockQuantity
        FROM cart
        JOIN products
        ON cart.product_id = products.product_id
        WHERE cart.user_id = ? AND products.product_id = ?`,
        [userId, item.productId],
      );

      // N:
      if (rows.length !== 1) {
        await connection.rollback();
        transactionStarted = false;
        return NextResponse.json(
          { message: "Invalid request" },
          { status: 400 },
        );
      }

      // Enough stock?
      const currentRow = rows[0]; // {userId, productId, productName, productPic, productPrice, stockQuantity}
      // N:
      if (currentRow.stockQuantity < item.quantity) {
        await connection.rollback();
        transactionStarted = false;
        return NextResponse.json(
          { message: "Not enough stock" },
          { status: 400 },
        );
      }

      // Update stock quantity
      const [updateResult] = await connection.query<ResultSetHeader>(
        "UPDATE products SET stock_quantity= stock_quantity - ? WHERE product_id = ? AND stock_quantity >= ?",
        [item.quantity, item.productId, item.quantity],
      );

      // Update success?
      // N:
      if (updateResult.affectedRows !== 1) {
        await connection.rollback();
        transactionStarted = false;
        return NextResponse.json(
          { message: "Can't update stock quantity" },
          { status: 400 },
        );
      }

      // Create current product object to user it later
      const orderItem: OrderItem = {
        productId: currentRow.productId,
        productName: currentRow.productName,
        productPic: currentRow.productPic,
        productPrice: currentRow.productPrice,
        quantity: item.quantity,
      };

      // Add current product object to orderItems array
      orderItems.push(orderItem);

      // Calculate subtotal
      subtotal += currentRow.productPrice * item.quantity;
    }
    // All items successfully validated?
    // Y:
    // Calculate order total
    const tax = subtotal * 0.15;
    const orderTotal = subtotal + shippingFee + tax;

    // Add current order to order table
    const [orderResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO
        orders (
        user_id,
        subtotal,
        shipping_fee,
        order_total)
        VALUES(?, ?, ?, ?) `,
      [userId, subtotal, shippingFee, orderTotal],
    );

    // Add data to order success?
    // N:
    if (orderResult.affectedRows !== 1) {
      await connection.rollback();
      transactionStarted = false;
      return NextResponse.json(
        { message: "Failed to add it to order table" },
        { status: 400 },
      );
    }

    // Get order_id
    const orderId = orderResult.insertId;

    // Add all items from orderItems to order_items table
    for (const item of orderItems) {
      const [res] = await connection.query<ResultSetHeader>(
        `INSERT INTO
        order_items (
        order_id,
        product_id,
        product_name,
        product_pic,
        quantity,
        price) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.productName,
          item.productPic,
          item.quantity,
          item.productPrice,
        ],
      );

      // Add success?
      // N:
      if (res.affectedRows !== 1) {
        await connection.rollback();
        transactionStarted = false;
        return NextResponse.json(
          { message: "Failed to add item to order_item table" },
          { status: 400 },
        );
      }
    }

    // Delete data from user's cart
    const [deleteResult] = await connection.query<ResultSetHeader>(
      "DELETE FROM cart WHERE user_id = ?",
      [userId],
    );

    // Delete data success?
    // N:
    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      transactionStarted = false;
      return NextResponse.json(
        { message: "Failed to delete data from user's cart" },
        { status: 400 },
      );
    }

    await connection.commit();
    transactionStarted = false;

    return NextResponse.json(
      { message: "Order successfully saved" },
      { status: 200 },
    );
  } catch (err: unknown) {
    console.error(err);

    if (transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
