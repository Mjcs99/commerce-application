import { useEffect, useState } from "react";
import { Button, Stack } from "react-bootstrap";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import { getProductDetails } from "../../product/Api/ProductsApiClient";
import type { ProductDetails } from "../../types/ProductDetails";
import "./CartItem.css";
type CartItemProps = {  
  id: string;
  quantity: number;
};

export function CartItem({ id, quantity }: CartItemProps) {
  const { removeFromCart } = useShoppingCart();
  const [product, setProduct] = useState<ProductDetails>();
  useEffect(() => {
    let cancelled = false;

    (async () => {
        try {
        const product = await getProductDetails(id);
        if (!cancelled) setProduct(product);
        } catch (error) {
        console.error("Failed to load product details for cart item", error);
        }
    })();

    return () => {
        cancelled = true;
    };
    }, [id]);
  return (
    <Stack direction="horizontal" gap={3} className="cart-item">
        {/* Change to display primary image for product */}
      <img
        src={product?.images[0]} 
        alt="Product"
        className="cart-item-image"
      />

      <div className="me-auto">
        <div className="cart-item-title">{product?.name}</div>
        <div className="cart-item-meta">Qty: {quantity}</div>
      </div>

      <div className="cart-item-price">${product?.price}</div>
      <Button
        variant="outline-danger"
        size="sm"
        aria-label="Remove item"
        onClick={() => removeFromCart(id)}
      >
        ✕
      </Button>
    </Stack>
  );
}
