import { apiRequest, type ApiResponse } from "../../client";

export type ModerationComment = {
  id: string;
  body: string;
  isHidden: boolean;
  user?: { email?: string };
  offer?: { title?: string };
};
export const listComments = () =>
  apiRequest<ApiResponse<ModerationComment[]>>("/admin/comments");
