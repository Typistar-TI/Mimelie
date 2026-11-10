import { apiRequest, type ApiResponse } from "../../client";
import type { AutomationControl } from "./get-automation-control";

export type UpdateAutomationControlInput = { paused: boolean };
export const updateAutomationControl = (input: UpdateAutomationControlInput) =>
  apiRequest<ApiResponse<AutomationControl>>("/admin/automation", {
    method: "PUT",
    body: JSON.stringify(input),
  });
