import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import ProductDetail from "./ProductDetail";
import getUserIdFromToken from "@/lib/auth";
import { getProduct } from "@/lib/product";
import { notFound } from "next/navigation";
import { getCartQuantity } from "@/lib/cart";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  // Get category_slug and product_id from browser
  const { slug, id } = await params;

  // Type validation
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  // Fetch single product data from DB
  const product = await getProduct(slug, productId);

  // Product doesn't exist => 404 Page not found
  if (!product) notFound();

  // User sign in?
  const userId = await getUserIdFromToken();
  const isSignIn = Boolean(userId);

  // Current product exists in user's cart?
  const cartQuantity = userId ? await getCartQuantity(userId, productId) : null;

  return (
    <main>
      <div className={styles.detailPageContainer}>
        <div className={styles.linkContainer}>
          <Link href={`/products/${slug}`} className={styles.link}>
            Go Back to List
          </Link>
        </div>
        <div className={styles.productContainer}>
          <div className={styles.imageContainer}>
            <Image
              className={styles.productImage}
              src={product.productPic}
              alt={product.productName}
              width={200}
              height={150}
            />
          </div>
          <div className={styles.productInfoContainer}>
            <h1>{product.productName}</h1>
            <p>{product.productDetails}</p>
            <p>${product.productPrice}</p>
            <ProductDetail
              product={product}
              isSignIn={isSignIn}
              cartQuantity={cartQuantity}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
