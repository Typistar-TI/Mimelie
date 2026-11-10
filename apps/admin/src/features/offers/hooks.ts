import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOffer,
  type CreateOfferInput,
} from "../../api/features/offers/create-offer";
import { listOffers } from "../../api/features/offers/list-offers";
import {
  updateOffer,
  type UpdateOfferInput,
} from "../../api/features/offers/update-offer";
import { listStores } from "../../api/features/catalog/list-stores";
import { listCategories } from "../../api/features/catalog/list-categories";

export const offerQueryKey = ["admin", "offers"] as const;
const catalogQueryKey = ["catalog", "form-options"] as const;
export const useOffers = () =>
  useQuery({ queryKey: offerQueryKey, queryFn: listOffers });
export const useOfferFormOptions = () =>
  useQuery({
    queryKey: catalogQueryKey,
    queryFn: async () => ({
      stores: (await listStores()).data,
      categories: (await listCategories()).data,
    }),
  });
export const useCreateOffer = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOfferInput) => createOffer(input),
    onSuccess: () => client.invalidateQueries({ queryKey: offerQueryKey }),
  });
};
export const useUpdateOffer = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOfferInput }) =>
      updateOffer(id, input),
    onSuccess: () => client.invalidateQueries({ queryKey: offerQueryKey }),
  });
};
