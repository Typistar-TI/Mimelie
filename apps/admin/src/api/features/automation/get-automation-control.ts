import { apiRequest, type ApiResponse } from "../../client";

export type AutomationControl = { paused: boolean };
export const getAutomationControl = () =>
  apiRequest<ApiResponse<AutomationControl>>("/admin/automation");
