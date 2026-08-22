'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartLine = { variantId: string; slug: string; name: string; variant: string; price: number; quantity: number };
type CartContextValue = { items: CartLine[]; count: number; total: number; add: (line: Omit<CartLine, 'quantity'>) => void; remove: (variantId: string) => void; setQuantity: (variantId: string, quantity: number) => void; clear: () => void };
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem('mimelie-cart') ?? '[]') as CartLine[]); } finally { setReady(true); } }, []);
  useEffect(() => { if (ready) localStorage.setItem('mimelie-cart', JSON.stringify(items)); }, [items, ready]);
  const value = useMemo<CartContextValue>(() => ({
    items, count: items.reduce((sum, item) => sum + item.quantity, 0), total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    add: (line) => setItems((current) => current.some((item) => item.variantId === line.variantId) ? current.map((item) => item.variantId === line.variantId ? { ...item, quantity: Math.min(20, item.quantity + 1) } : item) : [...current, { ...line, quantity: 1 }]),
    remove: (variantId) => setItems((current) => current.filter((item) => item.variantId !== variantId)),
    setQuantity: (variantId, quantity) => setItems((current) => current.map((item) => item.variantId === variantId ? { ...item, quantity: Math.max(1, Math.min(20, quantity)) } : item)),
    clear: () => setItems([]),
  }), [items]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const cart = useContext(CartContext); if (!cart) throw new Error('CartProvider missing'); return cart; }
