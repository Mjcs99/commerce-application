import styles from "./Step.module.css";

export default function Step({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className={styles.step}>
      <div className={styles.stepNum}>{number}</div>
      <div>
        <div className={styles.stepTitle}>{title}</div>
        <div className={styles.stepDesc}>{desc}</div>
      </div>
    </div>
  );
}
