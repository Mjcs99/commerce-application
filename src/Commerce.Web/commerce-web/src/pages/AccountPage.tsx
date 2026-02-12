import { useNavigate } from "react-router-dom";
import styles from "./AccountPage.module.css";
type AccountCard = {
  title: string;
  subtitle: string;
  icon: string;
  to: string;
};

export default function AccountPage() {
  const navigate = useNavigate();

  const cards: AccountCard[] = [
    { title: "Orders", subtitle: "Track, return, or reorder", icon: "📦", to: "/orders" },
    { title: "Profile", subtitle: "Personal details & preferences", icon: "👤", to: "/account/profile" }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>My Account</h1>
            <p className={styles.subtitle}>Manage your orders, details, and settings.</p>
          </div>

          <button
            className={styles.primaryBtn}
            onClick={() => navigate("/products")}
            type="button"
          >
            Continue shopping
          </button>
        </header>

        <section className={styles.grid}>
          {cards.map((c) => (
            <button
              key={c.title}
              className={styles.card}
              onClick={() => navigate(c.to)}
              type="button"
              aria-label={c.title}
            >
              <div className={styles.cardTop}>
                <div className={styles.iconWrap}>
                  <span className={styles.icon}>{c.icon}</span>
                </div>
                <span className={styles.chev}>→</span>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>{c.title}</div>
                <div className={styles.cardSubtitle}>{c.subtitle}</div>
              </div>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}
