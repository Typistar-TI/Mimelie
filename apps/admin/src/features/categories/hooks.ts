import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCategory,
  type CreateCategoryInput,
} from "../../api/features/categories/create-category";
import { listManagedCategories } from "../../api/features/categories/list-categories";
import {
  updateCategory,
  type UpdateCategoryInput,
} from "../../api/features/categories/update-category";
const key = ["admin", "categories"] as const;
export const useManagedCategories = () =>
  useQuery({ queryKey: key, queryFn: listManagedCategories });
export const useCreateCategory = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
};
export const useUpdateCategory = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      updateCategory(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
};
