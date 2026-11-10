import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../../api/client";
import { getCurrentUser } from "../../api/features/auth/get-current-user";
import { login, type LoginInput } from "../../api/features/auth/login";
import { logout } from "../../api/features/auth/logout";

export const sessionQueryKey = ["session"] as const;
export const useCurrentSession = () =>
  useQuery({
    queryKey: sessionQueryKey,
    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch (error) {
        // A missing session is the expected state of the login screen, not a
        // failed query that should surface Fastify's low-level JWT message.
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      }
    },
    retry: false,
  });
export const useLogin = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: () => client.invalidateQueries({ queryKey: sessionQueryKey }),
  });
};
export const useLogout = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => client.removeQueries({ queryKey: sessionQueryKey }),
  });
};
