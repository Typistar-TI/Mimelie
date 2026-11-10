import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

/**
 * One cache policy for the browser applications. API-specific query keys and
 * hooks deliberately remain with their owning application feature.
 */
export function createMimelieQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          const status =
            typeof error === "object" && error && "status" in error
              ? Number(error.status)
              : undefined;
          return status !== undefined && status >= 400 && status < 500
            ? false
            : failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}

export function MimelieQueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(createMimelieQueryClient);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
