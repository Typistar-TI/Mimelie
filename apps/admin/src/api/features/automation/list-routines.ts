import { apiRequest, type ApiResponse } from "../../client";

export type Routine = {
  id: string;
  name: string;
  enabled: boolean;
  dailyLimit: number;
  scheduleCron: string;
};
export const listRoutines = () =>
  apiRequest<ApiResponse<Routine[]>>("/admin/routines");
