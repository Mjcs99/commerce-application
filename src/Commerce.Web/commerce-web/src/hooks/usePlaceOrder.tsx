import { useMsal } from "@azure/msal-react";
import { useShoppingCart } from "../context/ShoppingCartContext";
import { placeOrderApi } from "../api/orders/OrdersApiClient";

export function usePlaceOrder() {
  const { cartItems } = useShoppingCart();
  const { instance } = useMsal();
  return async function placeOrder() {
    const account = instance.getActiveAccount();
    if (!account) throw new Error("Not signed in");

    const token = await instance.acquireTokenSilent({
      scopes: [import.meta.env.VITE_API_SCOPE!],
      account,
    });

    const payload = {
      items: (cartItems ?? []).map(i => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    };
    return await placeOrderApi(payload, token.accessToken);
  };
}
