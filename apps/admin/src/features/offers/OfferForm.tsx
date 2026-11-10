import { useState, type FormEvent } from "react";
import {
  Button,
  Field,
  Input,
  LoadingCard,
  Modal,
  Select,
} from "@mimelie/design-system";
import type { CategoryOption } from "../../api/features/catalog/list-categories";
import type { StoreOption } from "../../api/features/catalog/list-stores";
import { useCreateOffer } from "./hooks";

export function OfferForm({
  open,
  loading,
  stores,
  categories,
  onCancel,
  onSaved,
}: {
  open: boolean;
  loading: boolean;
  stores: StoreOption[];
  categories: CategoryOption[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const create = useCreateOffer();
  const [error, setError] = useState("");
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await create.mutateAsync({
        title: String(form.get("title")),
        storeId: String(form.get("storeId")),
        categoryId: String(form.get("categoryId") || "") || null,
        currentPrice: Number(form.get("currentPrice")),
        originalPrice: form.get("originalPrice")
          ? Number(form.get("originalPrice"))
          : null,
        affiliateUrl: String(form.get("affiliateUrl")),
        couponCode: String(form.get("couponCode") || "") || null,
        status: form.get("status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      });
      onSaved();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível salvar a oferta.",
      );
    }
  };
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="Cadastrar oferta"
      description="A oferta poderá ser salva como rascunho ou publicada imediatamente."
      footer={
        <>
          <Button
            variant="ghost"
            type="button"
            disabled={create.isPending}
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="offer-form"
            disabled={loading || create.isPending}
          >
            {create.isPending ? "Salvando…" : "Salvar oferta"}
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="grid gap-4">
          <LoadingCard lines={1} />
          <div className="grid gap-4 sm:grid-cols-2">
            <LoadingCard lines={1} />
            <LoadingCard lines={1} />
          </div>
          <LoadingCard lines={1} />
        </div>
      ) : (
        <form id="offer-form" className="grid gap-4" onSubmit={save}>
          <Field label="Título da oferta">
            <Input
              required
              name="title"
              minLength={8}
              placeholder="Ex.: Fone Bluetooth com cancelamento de ruído"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Loja">
              <Select required name="storeId" defaultValue="">
                <option disabled value="">
                  Selecione uma loja
                </option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Categoria">
              <Select name="categoryId" defaultValue="">
                <option value="">Sem categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Preço atual (R$)">
              <Input
                required
                name="currentPrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
              />
            </Field>
            <Field label="Preço original (R$)">
              <Input
                name="originalPrice"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Opcional"
              />
            </Field>
          </div>
          <Field label="Link da oferta">
            <Input
              required
              name="affiliateUrl"
              type="url"
              placeholder="https://"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Cupom">
              <Input name="couponCode" placeholder="Opcional" />
            </Field>
            <Field label="Status">
              <Select name="status" defaultValue="DRAFT">
                <option value="DRAFT">Salvar como rascunho</option>
                <option value="PUBLISHED">Publicar agora</option>
              </Select>
            </Field>
          </div>
          {error && (
            <p className="rounded-xl border border-danger/15 bg-danger-soft px-3.5 py-3 text-sm text-danger">
              {error}
            </p>
          )}
        </form>
      )}
    </Modal>
  );
}
