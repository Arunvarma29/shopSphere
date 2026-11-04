import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);
const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem("shopsphere_cart") || "[]");
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const persist = (next) => {
    setItems(next);
    localStorage.setItem("shopsphere_cart", JSON.stringify(next));
  };
  const addItem = (product, quantity = 1) => {
    const found = items.find((item) => item._id === product._id);
    persist(
      found
        ? items.map((item) =>
            item._id === product._id
              ? {
                  ...item,
                  quantity: Math.min(
                    item.quantity + quantity,
                    product.stock || 99,
                  ),
                }
              : item,
          )
        : [
            ...items,
            { ...product, quantity: Math.min(quantity, product.stock || 99) },
          ],
    );
  };
  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return persist(items.filter((item) => item._id !== id));
    persist(
      items.map((item) =>
        item._id === id
          ? { ...item, quantity: Math.min(quantity, item.stock || 99) }
          : item,
      ),
    );
  };
  const removeItem = (id) => persist(items.filter((item) => item._id !== id));
  const clearCart = () => persist([]);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, count, subtotal],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
