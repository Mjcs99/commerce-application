
import { post } from "../../shared/httpClient";

export type PlaceOrderRequest = {
  items: { productId: string; quantity: number }[];
};

export async function placeOrderApi(payload: PlaceOrderRequest, accessToken: string) {
  return post("/api/v1/order", {
        headers: 
        {
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });
}
