import { apiRequest, type ApiResponse } from "../../client";
import type { CreateRoutineInput } from "./create-routine";
import type { Routine } from "./list-routines";

export type UpdateRoutineInput = Partial<CreateRoutineInput>;
export const updateRoutine = (id: string, input: UpdateRoutineInput) =>
  apiRequest<ApiResponse<Routine>>(`/admin/routines/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
