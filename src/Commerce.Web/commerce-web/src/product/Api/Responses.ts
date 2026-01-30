import type { ProductSummary } from "../../types/ProductSummary";

export type GetProductsResponse = {
  items: ProductSummary[];
};

export type GetProductDetailsResponse = {
  productId: string;
  name: string;
  price: number;
  description: string;
  images: string[];
};

export type GetCategorySlugsResponse = {
  categorySlugs: string[];
}