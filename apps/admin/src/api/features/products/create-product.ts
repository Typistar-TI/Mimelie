import { apiRequest, type ApiResponse } from "../../client";
import type { AdminProduct } from "./list-products";

export type CreateProductInput = {
  name: string;
  shortDescription: string;
  category: string;
  status: "DRAFT" | "ACTIVE";
  variants: Array<{
    sku: string;
    name: string;
    price: number;
    stock: number;
    weightGrams?: number;
  }>;
  images?: Array<{ key: string; alt: string }>;
};

export const createProduct = (input: CreateProductInput) =>
  apiRequest<ApiResponse<AdminProduct>>("/admin/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
