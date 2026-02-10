import { createContext, useContext } from "react";
import { useState } from "react";
import { ShoppingCart } from "../components/ShoppingCart/ShoppingCart";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { CartItem, ProductSummary } from "../types/Product";

const ShoppingCartContext = createContext({} as ShoppingCartContext);

type ShoppingCartProviderProps = {
  children: React.ReactNode;
};

type ShoppingCartContext = {
    openCart?: () => void;
    closeCart?: () => void;
    getItemQuantity: (id: string) => number;
    increaseCartQuantity: (product: ProductSummary) => void;
    decreaseCartQuantity: (id: string) => void;
    removeFromCart: (id: string) => void;
    cartQuantity?: number;
    cartItems?: CartItem[];
};

export function useShoppingCart() {
  return useContext(ShoppingCartContext);
}

export function ShoppingCartProvider({ children }: ShoppingCartProviderProps) {
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>(
    "shopping-cart", []
  );
  const [isOpen, setIsOpen] = useState(false);

  const cartQuantity = new Set(cartItems.map(i => i.productId)).size;

  function getItemQuantity(id: string) {
    return cartItems.find(item => item.productId === id)?.quantity || 0;
  }

  function increaseCartQuantity(product: ProductSummary) {
    setCartItems(currItems => {
      const existing = currItems.find(i => i.productId === product.productId);
      if (!existing) {
        return currItems.concat({ ...product, quantity: 1 }); 
      }
      return currItems.map(i =>
        i.productId === product.productId ? { ...i, quantity: i.quantity + 1 } : i
      );
    });
  }

  function decreaseCartQuantity(id: string) {
    setCartItems(currItems => {
        if (currItems.find(item => item.productId === id)?.quantity === 1) {
          return currItems.filter(item => item.productId !== id);
        } else {
          return currItems.map(item => {
            if (item.productId === id) {
              return { ...item, quantity: item.quantity - 1 };
            } else {
              return item;
            }
          });
        }
      });
  }

  function removeFromCart(id: string) {
    setCartItems(currItems => currItems.filter(item => item.productId !== id));
  }

  const openCart = () => {setIsOpen(true);};
  const closeCart = () => {setIsOpen(false);};
  const contextValue = {
    getItemQuantity,
    increaseCartQuantity,
    decreaseCartQuantity,
    removeFromCart,
    openCart,
    closeCart,
    cartQuantity,
    cartItems,
    isOpen
  };

  return (
    <ShoppingCartContext.Provider value={contextValue}>
        <ShoppingCart isOpen={isOpen} />
        {children}
    </ShoppingCartContext.Provider>
  );
}