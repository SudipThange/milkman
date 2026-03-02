import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "punemilkman_cart_items";
const CartContext = createContext(null);

function readCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readCartFromStorage());
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  useEffect(() => {
    persistCart(items);
  }, [items]);

  useEffect(() => {
    const syncFromStorage = () => {
      setItems(readCartFromStorage());
    };

    window.addEventListener("storage", syncFromStorage);
    return () => {
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  useEffect(() => {
    const validItemIds = new Set(items.map((item) => item.id));
    setSelectedItemIds((prev) => prev.filter((id) => validItemIds.has(id)));
  }, [items]);

  const addItem = (product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price || 0),
          image: product.image,
          qty: 1,
        },
      ];
    });
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItemIds((prev) => prev.filter((itemId) => itemId !== id));
  };

  const changeQty = (id, delta) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, qty: Math.max(1, item.qty + delta) };
      })
    );
  };

  const clear = () => {
    setItems([]);
    setSelectedItemIds([]);
  };

  const setItemSelected = (itemId, isSelected) => {
    setSelectedItemIds((prev) => {
      if (isSelected) {
        if (prev.includes(itemId)) return prev;
        return [...prev, itemId];
      }
      return prev.filter((id) => id !== itemId);
    });
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const clearSelection = () => {
    setSelectedItemIds([]);
  };

  const removeItemsByIds = (itemIds) => {
    const idSet = new Set(itemIds);
    setItems((prev) => prev.filter((item) => !idSet.has(item.id)));
    setSelectedItemIds((prev) => prev.filter((id) => !idSet.has(id)));
  };

  const isItemSelected = (itemId) => selectedItemIds.includes(itemId);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items]
  );

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  );

  const selectedItems = useMemo(
    () => items.filter((item) => selectedItemIds.includes(item.id)),
    [items, selectedItemIds]
  );

  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [selectedItems]
  );

  const selectedCount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.qty, 0),
    [selectedItems]
  );

  const value = {
    items,
    total,
    count,
    selectedItemIds,
    selectedItems,
    selectedSubtotal,
    selectedCount,
    addItem,
    removeItem,
    changeQty,
    clear,
    setItemSelected,
    toggleItemSelection,
    isItemSelected,
    clearSelection,
    removeItemsByIds,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider.");
  }
  return context;
}
