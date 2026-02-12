import InputField from "./InputField";
import sharedStyles from "./ShippingForm.module.css"
import Step from "./Step";
import styles from "./Paymentform.module.css"
import { useMemo } from "react";

type PaymentForm = {
    cardNumber: number,
    expiryDate: Record<string, string>,
    cvv: string
}

export default function PaymentForm() {
  const form: PaymentForm = {
    cardNumber: 0,
    expiryDate: {
        month: "01",
        year: "2026"
    },
    cvv: "000",
  }
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        String(i + 1).padStart(2, "0")
      ),
    []
  );

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) =>
      String(currentYear + i)
    );
  }, []);

  function onMonthChange(value: string){
    form.expiryDate.month = value;
  }
  function onYearChange(value: string){
    form.expiryDate.year = value;
  }

  return (
    <div className={sharedStyles.card}>
        <div className={sharedStyles.cardHeader}>
            <h2 className={sharedStyles.cardTitle}>Payment</h2>
        </div>
        <div className={styles.stepRow}>
            <Step number="1" title="Secure Payment" desc="Shop with confidence" />
        </div>
        <InputField
            label="Credit Card Number"
            placeholder="1234 5678 9012 3456"
        />
        
        <InputField
            label="CVV"
            placeholder="123"
        />
        <label className={styles.label}>Expiry Date</label>
        <div className={styles.formRow}>
        <label className={styles.label}>Month</label>
                <select
                    className={styles.select}
                    value={form.expiryDate.month}

                    onChange={(e) => onMonthChange(e.target.value)}
                >
                    {months.map((month) => {
                    return <option value={month}>{month}</option>
                    })}
                </select>
                <label className={styles.label}>Year</label>
                <select
                    className={styles.select}
                    value={form.expiryDate.year}

                    onChange={(e) => onYearChange(e.target.value)}
                >
                {years.map((year) => {
                    return <option value={year}>{year}</option>
                })}
                </select>
        </div>
    
 </div>
  
  );
}
