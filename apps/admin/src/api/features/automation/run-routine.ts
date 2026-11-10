import { apiRequest, type ApiResponse } from "../../client";

export type RoutineExecution = {
  id: string;
  routineId: string;
  status: "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "PAUSED";
};
export const runRoutine = (id: string) =>
  apiRequest<ApiResponse<RoutineExecution>>(`/admin/routines/${id}/run`, {
    method: "POST",
  });
