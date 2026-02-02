import { useParams } from "react-router-dom";
import { createOrderConnection } from "../signalr/createOrderConnection";
import styles from "./OrderConfirmationPage.module.css";
import { useEffect, useState } from "react";
type OrderStatus = "Processing" | "Confirmed" | "Failed";
export default function OrderConfirmationPage() {
    const params = useParams<{ orderId: string }>();
    const [status, setStatus] = useState<OrderStatus>("Processing");
    useEffect(() => {
        if (!params.orderId) return;

        const connection = createOrderConnection();

        const onOrderUpdated = (id: string, newStatus: string) => {
            if (id !== params.orderId) return;
            setStatus(newStatus as OrderStatus);
        };

        type OrderPlacedPayload = { orderId: string; status: OrderStatus };

        connection.on("OrderStatus", (payload: OrderPlacedPayload) => {
            console.log(payload)
            if (payload.orderId !== params.orderId) return;
            setStatus(payload.status);
        });

        (async () => {
            await connection.start();

            await connection.invoke("JoinOrder", params.orderId);
            })().catch(console.error);

            return () => {
                connection.off("OrderStatus", onOrderUpdated);
                connection.stop().catch(() => {});
        };
    }, [params.orderId]);

  return (
    <div className={styles.container}>
        <h1>Thank you for your order!</h1>
        <p>Order ID: {params.orderId}</p>

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

        {status === "Failed" && (
        <p style={{ color: "red" }}>Something went wrong</p>
        )}
    </div>
    );
}


