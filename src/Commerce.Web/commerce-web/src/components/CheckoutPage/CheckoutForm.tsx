import styles from "./CheckoutForm.module.css";
import Step from "./Step.tsx";
import InputField from "./InputField.tsx";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { loginRequest } from "../../auth/msalConfig";

export default function CheckoutForm() {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Shipping & Delivery</h2>
        <p className={styles.cardHint}>No stress — you can review before paying.</p>
      </div>

      {isAuthenticated ? (
        <>
          <div className={styles.stepRow}>
            <Step number="1" title="Shipping address" desc="Where should we send the drip?" />
            <Step number="2" title="Delivery method" desc="Standard or express — your call." />
            <Step number="3" title="Payment" desc="Pay securely. We don’t store card details." />
          </div>

          <div className={styles.formGrid}>
            <InputField label="Full name" placeholder="John Doe" />
            <InputField label="Phone" placeholder="+1 (555) 123-4567" />
            <InputField label="Address line 1" placeholder="123 Jasper Ave" wide />
            <InputField label="Address line 2 (optional)" placeholder="Apt 7B" wide />
            <InputField label="City" placeholder="Edmonton" />
            <InputField label="Province" placeholder="AB" />
            <InputField label="Postal code" placeholder="T5J 0N3" />
            <InputField label="Country" placeholder="Canada" />
          </div>
        </>
      ) : (
        <div className={styles.locked}>
          <div className={styles.lockIcon}>🛡️</div>
          <h3 className={styles.lockTitle}>Sign in required</h3>
          <p className={styles.lockText}>
            Checkout is protected so we can attach the order to your account, apply discounts, and send receipts.
          </p>
          <div className={styles.actions}>
            <button
              className={styles.btnPrimary}
              type="button"
              disabled={inProgress !== "none"}
              onClick={() =>
                instance.loginRedirect({
                  ...loginRequest,
                  redirectStartPage: window.location.href,
                })
              }
            >
              Sign in to checkout
            </button>
          </div>
          <p className={styles.smallNote}>Tip: You can still browse products and build your cart while signed out.</p>
        </div>
      )}
    </div>
  );
}
