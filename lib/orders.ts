import db from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

type ValidRow = RowDataPacket & {
  userId: number;
  productId: number;
  productName: string;
  productPic: string;
  productPrice: number;
  stockQuantity: number;
};

// Data type sent from client
type OrderRequestItem = {
  productId: number;
  productQuantity: number;
};

type OrderItem = {
  productId: number;
  productName: string;
  productPic: string;
  productPrice: number;
  productQuantity: number;
};

export async function createOrder(userId: number, cart: OrderRequestItem[]) {
  // Create connection to handle transaction
  const connection = await db.getConnection();
  // Track if transaction start
  let transactionStarted = false;

  try {
    // Start transaction
    await connection.beginTransaction();
    transactionStarted = true;

    let subtotal = 0.0;
    const shippingFee = 0.0;
    // Array to store all order items in order_items DB
    const orderItems: OrderItem[] = [];

    for (const item of cart) {
      // Validate => User has current item in user's cart?
      const [rows] = await connection.query<ValidRow[]>(
        `SELECT
              cart.user_id AS userId,
              cart.product_id AS productId,
              products.product_name AS productName,
              products.product_pic AS productPic,
              products.product_price AS productPrice,
              products.stock_quantity AS stockQuantity
              FROM cart
              JOIN products
              ON cart.product_id = products.product_id
              WHERE cart.user_id = ? AND products.product_id = ?`,
        [userId, item.productId],
      );

      // N:
      if (rows.length !== 1) {
        throw new Error("INVALID_REQUEST");
      }

      // Enough stock?
      const currentRow = rows[0]; // {userId, productId, productName, productPic, productPrice, stockQuantity}
      // N:
      if (currentRow.stockQuantity < item.productQuantity) {
        throw new Error("NOT_ENOUGH_STOCK");
      }

      // Update stock quantity
      const [updateResult] = await connection.query<ResultSetHeader>(
        "UPDATE products SET stock_quantity= stock_quantity - ? WHERE product_id = ? AND stock_quantity >= ?",
        [item.productQuantity, item.productId, item.productQuantity],
      );

      // Update success?
      // N:
      if (updateResult.affectedRows !== 1) {
        throw new Error("STOCK_UPDATE_FAILED");
      }

      // Create current product object to save in order_items DB
      const orderItem: OrderItem = {
        productId: currentRow.productId,
        productName: currentRow.productName,
        productPic: currentRow.productPic,
        productPrice: currentRow.productPrice,
        productQuantity: item.productQuantity,
      };

      // Add current product object to orderItems array
      orderItems.push(orderItem);

      // Calculate subtotal
      subtotal += currentRow.productPrice * item.productQuantity;
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
      throw new Error("FAILED_TO_ADD_ORDER");
    }

    // Get order_id
    const orderId = orderResult.insertId;

    // Iterate orderItems array
    // Add all items to order_items table
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
          item.productQuantity,
          item.productPrice,
        ],
      );

      // Add success?
      // N:
      if (res.affectedRows !== 1) {
        throw new Error("FAILED_TO_ADD_ITEMS");
      }
    }

    // Delete data from user's cart after adding order
    const [deleteResult] = await connection.query<ResultSetHeader>(
      "DELETE FROM cart WHERE user_id = ?",
      [userId],
    );

    // Delete data success?
    // N:
    if (deleteResult.affectedRows === 0) {
      throw new Error("FAILED_TO_DELETE_CART_DATA");
    }

    await connection.commit();
    transactionStarted = false;
  } catch (err: unknown) {
    console.error(err);

    if (transactionStarted) {
      await connection.rollback();
      transactionStarted = false;
    }

    throw err;
  } finally {
    connection.release();
  }
}
