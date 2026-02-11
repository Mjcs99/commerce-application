export type CustomerDto = {
    id: string;             
    externalUserId: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAtUtc: string;  
    shippingAddress: ShippingAddress
};

export type ShippingAddress = {
  line1: string;
  line2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
};

export type UpdateCustomerRequest = Omit<CustomerDto, "email" | "phone" | "id" | "createdAtUtc" | "externalUserId">;

