import { useMsal } from "@azure/msal-react";
import styles from "./CheckoutPage.module.css";
import CheckoutHeader from "../components/CheckoutPage/CheckoutHeader.tsx";
import ShippingForm from "../components/CheckoutPage/ShippingForm.tsx";
import PaymentForm from "../components/CheckoutPage/PaymentForm.tsx";
import OrderSummary from "../components/CheckoutPage/OrderSummary.tsx";
import DemoDisabled from "../components/CheckoutPage/DemoDisabled.tsx"
export default function CheckoutPage() {
  const { accounts } = useMsal();
  const isAuthed = accounts.length > 0;
  const username = accounts[0]?.username ?? "Guest";

  const demoDisablePayments = true; 

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <CheckoutHeader isAuthed={isAuthed} username={username} />

        <div className={styles.grid}>
          <DemoDisabled
            disabled={demoDisablePayments}
            message="Demo only — payments disabled"
          >
            <PaymentForm />
          </DemoDisabled>

          <DemoDisabled
            disabled={demoDisablePayments}
            message="Demo only — shipping disabled"
          >
            <ShippingForm />
          </DemoDisabled>

          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
