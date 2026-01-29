import { createContext, useContext } from "react";
import { useState } from "react";
import { ShoppingCart } from "../components/ShoppingCart/ShoppingCart";
import { useLocalStorage } from "../hooks/useLocalStorage";

const ShoppingCartContext = createContext({} as ShoppingCartContext);

type ShoppingCartProviderProps = {
  children: React.ReactNode;
};

type CartItem = {
    id: string;
    quantity: number;
};

type ShoppingCartContext = {
    openCart?: () => void;
    closeCart?: () => void;
    getItemQuantity: (id: string) => number;
    increaseCartQuantity: (id: string) => void;
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
  const cartQuantity = cartItems.reduce((quantity, item) => quantity + item.quantity, 0);
  function getItemQuantity(id: string) {
    return cartItems.find(item => item.id === id)?.quantity || 0;
  }

  function increaseCartQuantity(id: string) {
    setCartItems(currItems => {
        if (currItems.find(item => item.id === id) == null) {
          return [...currItems, { id, quantity: 1 }];
        } else {
          return currItems.map(item => {
            if (item.id === id) {
              return { ...item, quantity: item.quantity + 1 };
            } else {
              return item;
            }
          });
        }
      });
  }

  function decreaseCartQuantity(id: string) {
    setCartItems(currItems => {
        if (currItems.find(item => item.id === id)?.quantity === 1) {
          return currItems.filter(item => item.id !== id);
        } else {
          return currItems.map(item => {
            if (item.id === id) {
              return { ...item, quantity: item.quantity - 1 };
            } else {
              return item;
            }
          });
        }
      });
  }

  function removeFromCart(id: string) {
    setCartItems(currItems => currItems.filter(item => item.id !== id));
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