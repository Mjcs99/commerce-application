import { useMsal } from "@azure/msal-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder } from "../api/orders/OrdersApiClient";
import styles from "./OrderDetailsPage.module.css"
import type { Order } from "../types/Order";

export default function OrderDetailsPage(){
    const { orderId } = useParams<{ orderId: string }>();
    const { instance, accounts } = useMsal();
    const [error, setOrderError] = useState<string | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const account = useMemo(
        () => instance.getActiveAccount() ?? accounts?.[0] ?? null,
        [instance, accounts]
    );

    useEffect(() => {
        if (!orderId) return;
        if (!account) return;

        let cancelled = false;

        (async () => {
            try {
            setLoading(true);
            setOrderError(null);

            const token = await instance.acquireTokenSilent({
                scopes: [import.meta.env.VITE_API_SCOPE!],
                account,
            });

            const o = await getOrder(token.accessToken, orderId);
            if (cancelled) return;

            setOrder(o);
            console.log("order loaded", o);
            } catch (e) {
            console.error("Failed to load order", e);
            if (!cancelled) setOrderError("Failed to load order details.");
            } finally {
            if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [orderId, account, instance]);

    const money = (n: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(n);

    const shortId = (id: string) => (id?.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id);

    const subtotal =
        order?.items?.reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 0), 0) ?? 0;

    const dateText = order?.createdAtUtc
        ? new Date(order.createdAtUtc).toLocaleString("en-CA", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "";

    return (
        <div className={styles.page}>
        <div className={styles.container}>
            <header className={styles.header}>
            <div>
                <p className={styles.kicker}>Order</p>
                <h1 className={styles.title}>{order ? shortId(order.orderId) : "—"}</h1>
                <p className={styles.meta}>
                <span className={styles.metaLabel}>Placed</span>
                <span className={styles.metaValue}>{dateText || "—"}</span>
                <span className={styles.dot}>•</span>
                <span className={styles.metaLabel}>Customer</span>
                <span className={styles.metaValue}>{order ? shortId(order.customerId) : "—"}</span>
                </p>
            </div>

            <div className={styles.headerRight}>
                <span
                className={[
                    styles.statusPill,
                    order?.status === "Confirmed"
                    ? styles.statusConfirmed
                    : order?.status === "Failed"
                    ? styles.statusFailed
                    : styles.statusProcessing,
                ].join(" ")}
                >
                {order?.status ?? "Loading"}
                </span>
            </div>
            </header>

            {loading && (
            <div className={styles.skeleton}>
                <div className={styles.skelRow} />
                <div className={styles.skelRow} />
                <div className={styles.skelRow} />
            </div>
            )}

            {error && (
            <div className={styles.errorBanner} role="alert">
                {error}
            </div>
            )}

            {!loading && !error && order && (
            <div className={styles.grid}>
                <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Items</h2>
                    <p className={styles.cardSub}>{order.items.length} item(s)</p>
                </div>

                <div className={styles.items}>
                    {order.items.map((item) => (
                    <div className={styles.itemRow} key={item.id}>
                        <div className={styles.thumb}>
                        <img src={item.primaryImageUrl} alt={item.name} />
                        </div>

                        <div className={styles.itemInfo}>
                        <p className={styles.itemName}>{item.name}</p>
                        <p className={styles.itemMeta}>
                            Qty <span className={styles.mono}>{item.quantity}</span>
                            <span className={styles.dot}>•</span>
                            <span className={styles.mono}>{money(item.price)}</span> each
                        </p>
                        </div>

                        <div className={styles.itemTotal}>
                        {money(item.price * item.quantity)}
                        </div>
                    </div>
                    ))}
                </div>
                </section>

                <aside className={styles.side}>
                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Summary</h2>
                    <p className={styles.cardSub}>CAD</p>
                    </div>

                    <div className={styles.summary}>
                    <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span className={styles.mono}>{money(subtotal)}</span>
                    </div>

                    <div className={styles.summaryRowMuted}>
                        <span>Shipping</span>
                        <span className={styles.mono}>Calculated at checkout</span>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.summaryTotal}>
                        <span>Total</span>
                        <span className={styles.mono}>{money(subtotal)}</span>
                    </div>
                    </div>
                </section>

                <section className={styles.card}>
                    <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Details</h2>
                    <p className={styles.cardSub}>Internal</p>
                    </div>

                    <div className={styles.details}>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Order ID</span>
                        <span className={`${styles.detailValue} ${styles.mono}`}>{order.orderId}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Status</span>
                        <span className={styles.detailValue}>{order.status}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailKey}>Created</span>
                        <span className={styles.detailValue}>{dateText}</span>
                    </div>
                    </div>
                </section>
                </aside>
            </div>
            )}
        </div>
        </div>
    );
    }