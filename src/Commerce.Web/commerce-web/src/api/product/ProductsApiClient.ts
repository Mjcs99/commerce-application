import { get } from "../../shared/httpClient";
import type { GetProductsResponse, GetCategorySlugsResponse, GetProductDetailsResponse } from "./Responses";

export function getProducts(sp?: URLSearchParams) {
  const qs = sp?.toString();
  return get<GetProductsResponse>(qs ? `/api/v1/products?${qs}` : `/api/v1/products`);
}

export function getProductDetails(productId: string) {
    return get<GetProductDetailsResponse>(`/api/v1/products/${productId}/details`);
}

export function getCategorySlugs(){
    return get<GetCategorySlugsResponse>("/api/v1/categories")
}
