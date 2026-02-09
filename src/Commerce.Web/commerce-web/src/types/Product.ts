export type ProductDetails = {
    productId: string;
    name: string;
    price: number;
    images: string[];
    description: string;
}

export type ProductSummary = {
  productId: string; 
  name: string;
  priceAmount: number;
  primaryImageUrl: string;
};

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