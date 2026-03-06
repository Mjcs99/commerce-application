import { Button, Stack } from "react-bootstrap";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import "./CartItem.css";
import type { ProductSummary } from "../../types/Product";
import { Link } from "react-router-dom";
type CartItemProps = {item: ProductSummary & { quantity: number; }};


export function CartItem({ item }: CartItemProps) {
  const { removeFromCart, closeCart } = useShoppingCart();
  return (
    <Stack direction="horizontal" gap={3} className="cart-item">
      <img
        src={item?.primaryImageUrl} 
        alt="Product"
        className="cart-item-image"
      />

      <div className="me-auto">
        <div className="cart-item-title"><Link to={`/products/${item?.productId}`} style={{textDecoration: "none", color: "inherit"}} onClick={closeCart}>{item?.name}</Link></div>
        <div className="cart-item-meta">Qty: {item?.quantity}</div>
      </div>

      <div className="cart-item-price">${item?.priceAmount}</div>
      <Button
        variant="outline-danger"
        size="sm"
        aria-label="Remove item"
        onClick={() => removeFromCart(item?.productId)}
      >
        ✕
      </Button>
    </Stack>
  );
}
