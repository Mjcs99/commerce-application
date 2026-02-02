import styles from "./OrderSummary.module.css";
import Row from "./Row.tsx";
import { useShoppingCart } from "../../context/ShoppingCartContext.tsx";
import { Link, useNavigate } from "react-router";
import { useIsAuthenticated } from "@azure/msal-react";
import { usePlaceOrder } from "../../hooks/usePlaceOrder.tsx";
import { useState } from "react";


export default function OrderSummary() {
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const { cartItems, cartQuantity } = useShoppingCart();
  const subTotal = cartItems?.reduce((total, item) => total + item.priceAmount, 0) || 0;
  const shippingCost = 9.99;
  const tax = subTotal * 0.05;
  const totalWithShippingAndTax = subTotal + shippingCost + tax;

  const placeOrderHook = usePlaceOrder();
  return (
    <div className={styles.summary}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <h2 className={styles.summaryTitle}>Order summary</h2>
          <span className={styles.pill}>{cartQuantity} items</span>
        </div>
        {cartItems?.map(item => (
            
            <div className={styles.lineItem}>
                <div>
                    <img src={item.primaryImageUrl} alt={item.name} className={styles.itemImage} style={{width: "40px", height: "40px"}}/>
                    <div className={styles.itemName}><Link to={`/products/${item.productId}`} style={{textDecoration: "none", color: "inherit"}}>{item.name}</Link></div>
                    <div>x {item.quantity}</div>
                </div>
                <div className={styles.price}>${item.priceAmount}</div>
            </div>

        ))}

        <div className={styles.divider} />

        <div className={styles.totals}>
          <Row label="Subtotal" value={`$${subTotal.toFixed(2)}`} />
          <Row label="Shipping" value={`$${shippingCost}`} />
          <Row label="Tax" value={`$${tax.toFixed(2)}`} />
        </div>

        <div className={styles.divider} />

        <div className={styles.totalRow}>
          <div className={styles.totalLabel}>Total</div>
          <div className={styles.totalValue}>${totalWithShippingAndTax.toFixed(2)}</div>
        </div>

        <button className={styles.cta} type="button" disabled={disabled} 
        onClick={
          async () => {
            const response = await placeOrderHook() as {orderId: string}; 
            setDisabled(true);
            navigate(`/confirmation/${response.orderId}`);
          }}>
          {isAuthenticated ? "Pay & place order" : "Sign in to continue"}
        </button>
      </div>
    </div>
  );
}
