import { createContext, useContext, useMemo, useState } from "react";
const C = createContext(null);
export const useCart = () => useContext(C);
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const add = (p) =>
    setItems((old) => {
      if (p.stock <= 0) return old;
      const found = old.find((x) => x._id === p._id);
      return found
        ? old.map((x) =>
            x._id === p._id
              ? { ...x, quantity: Math.min(x.quantity + 1, p.stock) }
              : x,
          )
        : [...old, { ...p, quantity: 1 }];
    });
  const change = (id, q) =>
    setItems((old) =>
      old.map((x) =>
        x._id === id && x.stock > 0
          ? {
              ...x,
              quantity: Math.min(
                x.stock,
                Math.max(1, Math.trunc(Number(q) || 1)),
              ),
            }
          : x,
      ),
    );
  const remove = (id) => setItems((old) => old.filter((x) => x._id !== id));
  const clear = () => setItems([]);
  const total = useMemo(
    () => items.reduce((s, x) => s + x.price * x.quantity, 0),
    [items],
  );
  return (
    <C.Provider
      value={{
        items,
        add,
        change,
        remove,
        clear,
        total,
        count: items.reduce((s, x) => s + x.quantity, 0),
      }}
    >
      {children}
    </C.Provider>
  );
}
