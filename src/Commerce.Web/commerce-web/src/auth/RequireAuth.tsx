import { useMsal } from "@azure/msal-react";

export function RequireAuth({ children }: { children: React.ReactNode }) {
    const {instance, accounts} = useMsal();
    const isAuthenticated = accounts.length > 0;
    if (!isAuthenticated) {
        return (
            <div>
                <p>Please sign in to continue checkout.</p>
                <button onClick={() => instance.loginRedirect()}>Sign in</button>
            </div>
        );
    }
    return (<>{children}</>);
}