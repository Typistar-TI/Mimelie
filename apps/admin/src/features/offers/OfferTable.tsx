import { useState, type FormEvent } from "react";
import {
  Button,
  EmptyState,
  Field,
  Input,
  Modal,
  StatusPill,
  useToast,
} from "@mimelie/design-system";
import type { AdminOffer } from "../../api/features/offers/list-offers";
import { useUpdateOffer } from "./hooks";

const brl = (number: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    number,
  );
const statusLabel = (status: AdminOffer["status"]) =>
  status === "PUBLISHED"
    ? "Publicada"
    : status === "DRAFT"
      ? "Rascunho"
      : status === "PAUSED"
        ? "Pausada"
        : "Expirada";
const toneFor = (status: AdminOffer["status"]) =>
  status === "PUBLISHED"
    ? ("green" as const)
    : status === "EXPIRED"
      ? ("red" as const)
      : ("orange" as const);

function EditOffer({
  offer,
  onClose,
}: {
  offer: AdminOffer | null;
  onClose: () => void;
}) {
  const update = useUpdateOffer();
  const { showToast } = useToast();
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!offer) return;
    const form = new FormData(event.currentTarget);
    try {
      await update.mutateAsync({
        id: offer.id,
        input: {
          title: String(form.get("title")),
          currentPrice: Number(form.get("currentPrice")),
          originalPrice: form.get("originalPrice")
            ? Number(form.get("originalPrice"))
            : null,
          couponCode: String(form.get("couponCode") || "") || null,
        },
      });
      showToast({ title: "Oferta atualizada", tone: "success" });
      onClose();
    } catch (error) {
      showToast({
        title: "Não foi possível salvar",
        description: error instanceof Error ? error.message : undefined,
        tone: "error",
      });
    }
  };
  return (
    <Modal
      open={Boolean(offer)}
      onClose={onClose}
      title="Editar oferta"
      description="Altere somente os campos que precisam ser revisados."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={update.isPending}>
            Cancelar
          </Button>
          <Button form="edit-offer" type="submit" disabled={update.isPending}>
            {update.isPending ? "Salvando…" : "Salvar alterações"}
          </Button>
        </>
      }
    >
      <form id="edit-offer" className="grid gap-4" onSubmit={save}>
        <Field label="Título">
          <Input
            name="title"
            required
            minLength={8}
            defaultValue={offer?.title}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Preço atual">
            <Input
              name="currentPrice"
              required
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={offer?.currentPrice}
            />
          </Field>
          <Field label="Preço anterior">
            <Input
              name="originalPrice"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={offer?.originalPrice ?? ""}
            />
          </Field>
        </div>
        <Field label="Cupom">
          <Input name="couponCode" defaultValue={offer?.couponCode ?? ""} />
        </Field>
      </form>
    </Modal>
  );
}

export function OfferTable({ offers }: { offers: AdminOffer[] }) {
  const update = useUpdateOffer();
  const { showToast } = useToast();
  const [editing, setEditing] = useState<AdminOffer | null>(null);
  const changeStatus = async (
    offer: AdminOffer,
    status: AdminOffer["status"],
  ) => {
    try {
      await update.mutateAsync({ id: offer.id, input: { status } });
      showToast({
        title:
          status === "EXPIRED"
            ? "Oferta expirada"
            : status === "PUBLISHED"
              ? "Oferta publicada"
              : "Status atualizado",
        description:
          status === "PUBLISHED"
            ? "A oferta está disponível para distribuição."
            : undefined,
        tone: "success",
      });
    } catch (error) {
      showToast({
        title: "Não foi possível atualizar",
        description: error instanceof Error ? error.message : undefined,
        tone: "error",
      });
    }
  };
  if (!offers.length)
    return (
      <EmptyState
        title="Nenhuma oferta cadastrada"
        description="Cadastre a primeira oferta para começar a montar seu catálogo."
      />
    );
  return (
    <>
      <div className="hidden grid-cols-[minmax(15rem,1fr)_7rem_7rem_6rem_12rem] gap-3 bg-surface-subtle/65 px-5 py-3 text-[10px] font-semibold uppercase tracking-[.11em] text-ink/42 lg:grid">
        <span>Oferta</span>
        <span>Preço</span>
        <span>Status</span>
        <span>Atualizada</span>
        <span className="text-right">Ações</span>
      </div>
      {offers.slice(0, 20).map((offer, index) => (
        <article
          className="grid gap-3 border-t border-line px-5 py-4 transition hover:bg-mist/45 lg:grid-cols-[minmax(15rem,1fr)_7rem_7rem_6rem_12rem] lg:items-center"
          key={offer.id}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-semibold ${["bg-info-soft text-info", "bg-brand-soft text-brand", "bg-pine-soft text-pine", "bg-surface-subtle text-ink/65"][index % 4]}`}
            >
              {offer.store.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <b className="block truncate text-sm font-semibold">
                {offer.title}
              </b>
              <small className="mt-0.5 block text-xs text-ink/50">
                {offer.store.name}
              </small>
            </div>
          </div>
          <strong className="text-sm font-semibold">
            {brl(offer.currentPrice)}
          </strong>
          <StatusPill tone={toneFor(offer.status)}>
            {statusLabel(offer.status)}
          </StatusPill>
          <small className="text-xs text-ink/50">
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeZone: "America/Sao_Paulo",
            }).format(new Date(offer.updatedAt))}
          </small>
          <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
            <Button variant="ghost" size="sm" onClick={() => setEditing(offer)}>
              Editar
            </Button>
            {offer.status !== "PUBLISHED" && (
              <Button
                variant="subtle"
                size="sm"
                disabled={update.isPending}
                onClick={() => void changeStatus(offer, "PUBLISHED")}
              >
                Publicar
              </Button>
            )}
            {offer.status === "PUBLISHED" && (
              <Button
                variant="subtle"
                size="sm"
                disabled={update.isPending}
                onClick={() => void changeStatus(offer, "PAUSED")}
              >
                Pausar
              </Button>
            )}
            {offer.status !== "EXPIRED" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-danger hover:bg-danger-soft hover:text-danger"
                disabled={update.isPending}
                onClick={() => void changeStatus(offer, "EXPIRED")}
              >
                Expirar
              </Button>
            )}
          </div>
        </article>
      ))}
      <EditOffer offer={editing} onClose={() => setEditing(null)} />
    </>
  );
}
