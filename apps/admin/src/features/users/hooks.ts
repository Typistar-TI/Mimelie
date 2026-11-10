import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listUsers } from "../../api/features/users/list-users";
import {
  updateUserRole,
  type UpdateUserRoleInput,
} from "../../api/features/users/update-user-role";
const key = ["admin", "users"] as const;
export const useUsers = () => useQuery({ queryKey: key, queryFn: listUsers });
export const useUpdateUserRole = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserRoleInput }) =>
      updateUserRole(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
};
