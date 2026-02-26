import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createOrderConnection } from "../signalr/createOrderConnection";
import { useShoppingCart } from "../context/ShoppingCartContext";
import { getOrderStatus } from "../api/orders/OrdersApiClient"
import styles from "./OrderConfirmationPage.module.css";
import { useMsal } from "@azure/msal-react";
import { type OrderStatus } from "../types/Order"

export default function OrderConfirmationPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const navigate = useNavigate();
  const [status, setStatus] = useState<OrderStatus>();
  const [reason, setReason] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { cartItems, removeFromCart } = useShoppingCart();
  const [secondsLeft, setSecondsLeft] = useState<number>(10);
  const { instance } = useMsal();
  


useEffect(() => {
  const account = instance.getActiveAccount();
  if (!orderId || !account) return;

  const controller = new AbortController();

  (async () => {
    try {
      const token = await instance.acquireTokenSilent({
        scopes: [import.meta.env.VITE_API_SCOPE!],
        account,
      });

      const orderStatus = (await getOrderStatus(
        token.accessToken,
        orderId
      )) as OrderStatus;

      setStatus(orderStatus);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      console.error(e);

    }
  })();

  return () => controller.abort();
}, [instance, orderId]);
  
  useEffect(() => {
    if (!orderId) return;

    const connection = createOrderConnection();

    connection.on("OrderStatus", (payload: { orderId: string; status: OrderStatus; reason: string; }) => {
      if (payload.orderId !== orderId) return;
      setStatus(payload.status);
      setReason(payload.reason);
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
    if (status?.status !== "Confirmed") return;
    if (clearedRef.current) return;
    if (!cartItems?.length) return;

    cartItems.forEach((item) => removeFromCart(item.productId));
    clearedRef.current = true;
    {navigate(`/orders/${orderId}`)}
  }, [status, cartItems, removeFromCart]);

  useEffect(() => {
    if (status?.status !== "Confirmed") return;
    if (clearedRef.current) return;
    if (!cartItems?.length) return;

    cartItems.forEach((item) => removeFromCart(item.productId));
    clearedRef.current = true;
    {navigate(`/orders/${orderId}`)}
  }, [status, cartItems, removeFromCart]);

  useEffect(() => {
    if (status?.status !== "Cancelled" || reason !== "OutOfStock") return;

    setErrorMessage("One or more items in the placed order is out of stock.");
    setSecondsLeft(10);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status, reason, navigate]);
  
  return (
    <div className={styles.container}>
      <h1>Thank you for your order!</h1>
      <p>Order ID: {orderId}</p>

      {status?.status === "Processing" && (
        <div className={styles.processing}>
          <div className={styles.spinner} />
          <p>Confirming your order…</p>
        </div>
      )}
      {errorMessage && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <p>{errorMessage}</p>
            <p>Redirecting in {secondsLeft} seconds...</p>
          </div>
        </div>
      )}
    </div>
  );
}


