import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getOrdersApi} from "../api/orders/OrdersApiClient";
import { type Order } from "../types/Order" 
import styles from "./MyOrdersPage.module.css";
export default function MyOrdersPage() {
  const { instance } = useMsal();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const account = instance.getActiveAccount();
    if (!account) {
      setLoading(false);
      setError("Not signed in (no active account).");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await instance.acquireTokenSilent({
          scopes: [import.meta.env.VITE_API_SCOPE!],
          account,
        });

        const orders = await getOrdersApi(token.accessToken);
        setOrders(orders);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [instance]);

  if (loading) return <div>Loading orders…</div>;
  if (error) return <div style={{ color: "crimson" }}>Error: {error}</div>;
  if (orders.length === 0) return <div>No orders yet.</div>;



return (
  <div className={styles.page}>
    <h1 className={styles.title}>My Orders</h1>

    {orders.map(order => (
      <div key={order.orderId} className={styles.orderCard}>
        <div className={styles.orderHeader}>
          <span className={styles.orderId}>Order #{order.orderId.slice(0, 8)}</span>
          <span className={styles.status}>{order.status}</span>
        </div>

        <div className={styles.items}>
          {order.items.map(item => (
            <div key={item.id} className={styles.itemRow}>
              <span className={styles.product}>{item.productId.slice(0, 8)}</span>
              <span className={styles.quantity}>× {item.quantity}</span>
              <span className={styles.price}>${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <span className={styles.date}>
            {new Date(order.createdAtUtc).toLocaleDateString()}
          </span>
        </div>
      </div>
    ))}
  </div>
);

}
