import { apiRequest, type ApiResponse } from "../../client";
import type { ModerationComment } from "./list-comments";

export type UpdateCommentInput = { isHidden: boolean };
export const updateComment = (id: string, input: UpdateCommentInput) =>
  apiRequest<ApiResponse<ModerationComment>>(`/admin/comments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
