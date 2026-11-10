import { apiRequest, type ApiResponse } from "../../client";
import type { Routine } from "./list-routines";

export type RoutineFilters = {
  keywords: string[];
  categories: string[];
  minPrice?: number;
  maxPrice?: number;
  minDiscount?: number;
};
export type CreateRoutineInput = {
  name: string;
  enabled: boolean;
  scheduleCron: string;
  dailyLimit: number;
  filters: RoutineFilters;
  destinations: string[];
};
export const createRoutine = (input: CreateRoutineInput) =>
  apiRequest<ApiResponse<Routine>>("/admin/routines", {
    method: "POST",
    body: JSON.stringify(input),
  });
