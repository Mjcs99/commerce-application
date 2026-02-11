import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";

export default function AuthBootstrap() {
  const { instance, accounts, inProgress } = useMsal();
  useEffect(() => {
    instance.handleRedirectPromise().catch(console.error);
  }, [instance]);
  useEffect(() => {
    if (inProgress !== "none") return;

    const active = instance.getActiveAccount();
    if (!active && accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
    }
  }, [instance, accounts, inProgress]);

  return null;
}
