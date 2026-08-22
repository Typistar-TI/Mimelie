'use client';
import { QueryProvider } from '../app/api/query-provider';
import { CartProvider } from './cart-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return <QueryProvider><CartProvider>{children}</CartProvider></QueryProvider>;
}
