import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listIntegrations } from "../../api/features/integrations/list-integrations";
import {
  updateIntegration,
  type UpdateIntegrationInput,
} from "../../api/features/integrations/update-integration";
import { validateWhatsApp } from "../../api/features/integrations/validate-whatsapp";
const key = ["admin", "integrations"] as const;
export const useIntegrations = () =>
  useQuery({ queryKey: key, queryFn: listIntegrations });
export const useUpdateIntegration = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      provider,
      input,
    }: {
      provider: string;
      input: UpdateIntegrationInput;
    }) => updateIntegration(provider, input),
    onSuccess: () => client.invalidateQueries({ queryKey: key }),
  });
};
export const useValidateWhatsApp = () =>
  useMutation({ mutationFn: validateWhatsApp });
