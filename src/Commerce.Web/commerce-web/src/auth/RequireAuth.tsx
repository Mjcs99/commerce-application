import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { Outlet } from "react-router-dom";
import styles from "./RequireAuth.module.css"
export function RequireAuth() {
  const { instance } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>
            Sign in to access your account and continue.
          </p>

          <button
            className={styles.button}
            onClick={() =>
              instance.loginRedirect({
                scopes: [import.meta.env.VITE_API_SCOPE!],
                prompt: "login",
              })
            }
          >
            Sign in
          </button>

          <p className={styles.footer}>Secure authentication powered by Microsoft</p>
        </div>
      </div>
    );
  }
  return <Outlet/>;
}

