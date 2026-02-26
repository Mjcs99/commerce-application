export type PlaceOrderRequest = {
  items: { productId: string; quantity: number }[];
};
export type GetOrdersResponse = {
  orders: Order[];
};
export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  name: string;
  primaryImageUrl: string;
};

export type Order = {
  orderId: string;
  customerId: string;
  status: string;
  createdAtUtc: string;
  items: OrderItem[];
};

export type OrderStatus = {status: string}