import { useMsal } from "@azure/msal-react";
import { useEffect } from "react";

export function AuthBootstrap() {
  const { instance, accounts } = useMsal();

  useEffect(() => {
    if (!instance.getActiveAccount() && accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
    }
  }, [accounts, instance]);

  return null;
}
