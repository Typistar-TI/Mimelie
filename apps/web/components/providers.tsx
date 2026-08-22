'use client';
import { QueryProvider } from '../app/api/query-provider';
import { CartProvider } from './cart-provider';
import { CartDrawer } from './cart-drawer';

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryProvider><CartProvider>{children}<CartDrawer/></CartProvider></QueryProvider>;
}
