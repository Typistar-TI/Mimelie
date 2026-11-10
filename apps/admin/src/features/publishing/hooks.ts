import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listPublications } from "../../api/features/publishing/list-publications";
import {
  updatePublication,
  type UpdatePublicationInput,
} from "../../api/features/publishing/update-publication";
const key = ["admin", "publications"] as const;
export const usePublications = () =>
  useQuery({ queryKey: key, queryFn: listPublications });
export const useUpdatePublication = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdatePublicationInput;
    }) => updatePublication(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
};
