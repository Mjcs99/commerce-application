import { post, patch } from "../../shared/httpClient"
import type { CustomerDto, UpdateCustomerRequest } from "../../types/Customer";

export function getUser(accessToken: string)
{
    const response = post<CustomerDto>("/api/v1/customer/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response;
}

export function updateUser(payload: UpdateCustomerRequest, accessToken: string)
{
    const response = patch("/api/v1/customer/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload)
      });
      return response;
}