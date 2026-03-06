import styles from "./InputField.module.css";

export default function InputField({
  label,
  placeholder,
  wide,
}: {
  label: string;
  placeholder: string;
  wide?: boolean;
}) {
  return (
    <label className={`${styles.field} ${wide ? styles.wide : ""}`}>
      <span className={styles.label}>{label}</span>
      <input className={styles.input} placeholder={placeholder} />
    </label>
  );
}
