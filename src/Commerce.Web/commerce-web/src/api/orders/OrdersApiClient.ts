import { post, get } from "../../shared/httpClient";
import { type PlaceOrderRequest, type GetOrdersResponse, type Order } from "../../types/Order";

export async function placeOrderApi(payload: PlaceOrderRequest, accessToken: string) {
  return post("/api/v1/orders", {
        headers: 
        {
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
    });
}

export async function getOrdersApi(accessToken: string): Promise<Order[]> {
  const response = await get<GetOrdersResponse>("/api/v1/orders", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.orders;
}

