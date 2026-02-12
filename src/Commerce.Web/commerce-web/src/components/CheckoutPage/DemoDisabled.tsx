import styles from "./DemoDisabled.module.css"

export default function DemoDisabled({
  disabled,
  message,
  children,
}: {
  disabled: boolean;
  message?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.demoWrap}>
      <div className={disabled ? styles.demoDisabled : ""}>{children}</div>

      {disabled && (
        <div className={styles.demoOverlay} aria-hidden="true">
          <div className={styles.demoPill}>
            {message ?? "Demo mode — disabled"}
          </div>
        </div>
      )}
    </div>
  );
}
