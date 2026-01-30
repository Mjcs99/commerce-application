import { Button, Offcanvas, Stack } from "react-bootstrap";
import { useShoppingCart } from "../../context/ShoppingCartContext";
import { CartItem } from "./CartItem";
import { useNavigate } from "react-router-dom";

type ShoppingCartProps = {
    isOpen: boolean;
};
export function ShoppingCart({ isOpen }: ShoppingCartProps) {
    const {closeCart, cartQuantity, cartItems} = useShoppingCart();
    const navigate = useNavigate();
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
                    <CartItem item={item} />
                ))}
            </Stack>
            {quantity > 0 && (
                <div className="pt-3 border-top">
                    <Button variant="dark" size="lg" className="w-100" onClick={() => {
                        navigate('/checkout');
                        closeCart?.();}}>
                    Checkout
                    </Button>
                </div>
                )}
        </Offcanvas.Body>
    </Offcanvas>
    );
}