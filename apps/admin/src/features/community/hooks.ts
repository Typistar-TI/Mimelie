import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listComments } from "../../api/features/community/list-comments";
import {
  updateComment,
  type UpdateCommentInput,
} from "../../api/features/community/update-comment";
const key = ["admin", "comments"] as const;
export const useComments = () =>
  useQuery({ queryKey: key, queryFn: listComments });
export const useUpdateComment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCommentInput }) =>
      updateComment(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
};
