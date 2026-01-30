import styles from "./CheckoutHeader.module.css";

export default function CheckoutHeader({
  isAuthed,
  username,
}: {
  isAuthed: boolean;
  username: string;
}) {
  return (
    <div className={styles.header}>
      <div>
        <div className={styles.kicker}>Secure Checkout</div>
        <h1 className={styles.title}>Finalize your order</h1>
        <p className={styles.subTitle}>
          {isAuthed ? (
            <>
              Welcome back, <span className={styles.accent}>{username}</span>. Let’s get this order locked in.
            </>
          ) : (
            <>You’re almost there. Sign in to place your order and get tracking updates.</>
          )}
        </p>
      </div>
    </div>
  );
}
