import { Offcanvas, Stack } from "react-bootstrap";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import { CartItem } from "./CartItem";


type ShoppingCartProps = {
    isOpen: boolean;
};
export function ShoppingCart({ isOpen }: ShoppingCartProps) {
    const {closeCart, cartQuantity, cartItems} = useShoppingCart();
    const quantity = cartQuantity ?? 0;
    return (
    <Offcanvas show={isOpen} onHide={closeCart} placement="end">
        <Offcanvas.Header closeButton>
            <Offcanvas.Title>Shopping Cart</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            {quantity === 0 && <div>Cart is currently empty</div>}
            <Stack gap={3}>
                {cartItems?.map(item => (
                    <CartItem id={item.id} quantity={item.quantity} />
                ))}
            </Stack>
        </Offcanvas.Body>
    </Offcanvas>
    );
}