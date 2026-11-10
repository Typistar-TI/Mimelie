import { apiRequest, type ApiResponse } from "../../client";

export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  category: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  variants: Array<{
    id: string;
    name: string;
    price: number;
    sku: string;
    stock: number;
  }>;
  images: Array<{ key: string; alt: string }>;
};

export const productsQueryKey = ["admin", "products"] as const;

export const listProducts = () =>
  apiRequest<ApiResponse<AdminProduct[]>>("/admin/products");
