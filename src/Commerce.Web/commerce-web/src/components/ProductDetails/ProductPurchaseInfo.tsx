import styles from "./ProductPurchaseInfo.module.css";
import type { ProductDetails } from "../../types/ProductDetails.ts";
import { useShoppingCart } from "../../context/ShoppingCartContext.tsx";
export default function ProductPurchaseInfo({ product }: { product: ProductDetails }) {
    const { increaseCartQuantity } = useShoppingCart();

    return(
        <div className={styles.purchaseInfoContainer}>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <div className={styles.priceContainer}>
                <p className={styles.price}>{product.price}</p><p>CAD</p> {/* Fix hardcoded currency */}
            </div>
            <button className={styles.addToCartButton} onClick={() => increaseCartQuantity(product.productId)}>Add to Cart</button>
        </div>
    )
}