import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getOrders } from "../api/orders/OrdersApiClient";
import { type Order, type OrderItem } from "../types/Order" 
import styles from "./OrdersPage.module.css";
export default function OrdersPage() {
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

        const orders = await getOrders(token.accessToken);
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

  function calculateOrderTotal(order: Order){
    return order.items.reduce((total: number, item: OrderItem) => {return total + item.price * item.quantity}, 0);
  }
  
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
            <div className={styles.thumb}>
                <span><img src={item.primaryImageUrl}/></span>
              </div>
              <span className={styles.product}>{item.name}</span>
              <span className={styles.quantity}>× {item.quantity}</span>
              <span className={styles.price}>${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          <div className={styles.total}>
            <span>Total:</span>
            <span>${(calculateOrderTotal(order) * 1.05).toFixed(2)}</span> {/* Store order totals */}
          </div>
          <span className={styles.date}>
            {new Date(order.createdAtUtc).toLocaleDateString()}
          </span>
        </div>
      </div>
    ))}
  </div>
);

}
