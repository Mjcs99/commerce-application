import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createOrderConnection } from "../signalr/createOrderConnection";
import { useShoppingCart } from "../context/ShoppingCartContext";

import styles from "./OrderConfirmationPage.module.css";

type OrderStatus = "Processing" | "Confirmed" | "Failed";

export default function OrderConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus>("Processing");

  const { cartItems, removeFromCart } = useShoppingCart();


  useEffect(() => {
    if (!orderId) return;

    const connection = createOrderConnection();

    connection.on("OrderStatus", (payload: { orderId: string; status: OrderStatus }) => {
      if (payload.orderId !== orderId) return;
      setStatus(payload.status);
    });

    (async () => {
      await connection.start();
      await connection.invoke("JoinOrder", orderId);
    })().catch(console.error);

    return () => {
      connection.off("OrderStatus");
      connection.stop().catch(() => {});
    };
  }, [orderId]);

  const clearedRef = useRef(false);

  useEffect(() => {
    if (status !== "Confirmed") return;
    if (clearedRef.current) return;
    if (!cartItems?.length) return;

    cartItems.forEach((item) => removeFromCart(item.productId));
    clearedRef.current = true;
    {navigate(`/orders/${orderId}`)}
  }, [status, cartItems, removeFromCart]);

  return (
    <div className={styles.container}>
      <h1>Thank you for your order!</h1>
      <p>Order ID: {orderId}</p>

      {status === "Processing" && (
        <div className={styles.processing}>
          <div className={styles.spinner} />
          <p>Confirming your order…</p>
        </div>
      )}

      {status === "Confirmed" && (
        <div className={styles.confirmed}>
          <div className={styles.check}>✓</div>
          <p>Your order is confirmed!</p>  
        </div>
      )}

      {status === "Failed" && <p style={{ color: "red" }}>Something went wrong</p>}
    </div>
  );
}


