import { useMsal } from "@azure/msal-react";
import styles from "./CheckoutPage.module.css";
import CheckoutHeader from "../components/CheckoutPage/CheckoutHeader.tsx";
import CheckoutForm from "../components/CheckoutPage/CheckoutForm.tsx";
import OrderSummary from "../components/CheckoutPage/OrderSummary.tsx";

export default function CheckoutPage() {
  const { accounts } = useMsal();
  const isAuthed = accounts.length > 0;
  const username = accounts[0]?.username ?? "Guest";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <CheckoutHeader isAuthed={isAuthed} username={username} />
        <div className={styles.grid}>
          <CheckoutForm isAuthed={isAuthed} />
          <OrderSummary isAuthed={isAuthed} />
        </div>
      </div>
    </div>
  );
}
