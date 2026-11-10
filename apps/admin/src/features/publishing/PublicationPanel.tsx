import { useState } from "react";
import {
  Button,
  Card,
  EmptyState,
  LoadingCard,
  PanelHeader,
} from "@mimelie/design-system";
import { usePublications, useUpdatePublication } from "./hooks";
const brl = (number: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    number,
  );
export function PublicationPanel() {
  const publications = usePublications();
  const update = useUpdatePublication();
  const [notice, setNotice] = useState("");
  const change = async (id: string, status: "PENDING" | "PAUSED") => {
    try {
      await update.mutateAsync({ id, input: { status } });
      setNotice(
        status === "PENDING"
          ? "Publicação recolocada na fila."
          : "Publicação pausada.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a publicação.",
      );
    }
  };
  const items = publications.data?.data ?? [];
  if (publications.isLoading)
    return (
      <Card className="p-5 sm:p-6">
        <PanelHeader eyebrow="Distribuição" title="Publicações" />
        <div className="mt-5 grid gap-3">
          <LoadingCard lines={2} />
          <LoadingCard lines={2} />
        </div>
      </Card>
    );
  return (
    <Card className="p-5 sm:p-6">
      <PanelHeader
        eyebrow="Distribuição"
        title="Publicações"
        description="Uma falha não bloqueia os outros destinos. Reenviar usa a fila idempotente do worker."
      />
      <div className="mt-5 grid gap-3">
        {items.length ? (
          items.map((item) => (
            <article
              className="flex flex-col justify-between gap-4 rounded-xl border border-line p-4 sm:flex-row"
              key={item.id}
            >
              <div>
                <strong className="text-sm">
                  {item.offer?.title ?? "Oferta"}{" "}
                  <em className="ml-1 font-mono text-[10px] not-italic text-brand">
                    {item.destination}
                  </em>
                </strong>
                <small className="mt-1 block text-xs text-ink/50">
                  {item.status} · {item.attempts} tentativa(s)
                  {item.error ? ` · ${item.error}` : ""}
                </small>
                <div className="mt-3 grid gap-1 rounded-xl border border-dashed border-line bg-mist p-3">
                  <span className="w-max rounded bg-pine-soft px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-pine">
                    {item.destination}
                  </span>
                  <b className="text-sm">
                    {item.offer?.title ?? "Oferta Mimelie"}
                  </b>
                  <strong className="text-lg text-brand">
                    {item.offer?.currentPrice === undefined
                      ? "Preço pendente"
                      : brl(Number(item.offer.currentPrice))}
                  </strong>
                  <small className="text-xs text-ink/50">
                    {item.offer?.store?.name ?? "Loja"}
                    {item.offer?.couponCode
                      ? ` · cupom ${item.offer.couponCode}`
                      : ""}
                  </small>
                  <em className="text-[10px] not-italic text-ink/50">
                    Preço conferido pela equipe. Alguns links podem render
                    comissão.
                  </em>
                </div>
              </div>
              {item.status !== "SENT" && (
                <Button
                  disabled={update.isPending}
                  onClick={() =>
                    void change(
                      item.id,
                      item.status === "PAUSED" ? "PENDING" : "PAUSED",
                    )
                  }
                >
                  {item.status === "PAUSED" ? "Retomar" : "Pausar"}
                </Button>
              )}
            </article>
          ))
        ) : (
          <EmptyState
            title="Ainda não há publicações na fila"
            description="As próximas distribuições aparecerão aqui."
          />
        )}
      </div>
      {(notice || publications.error) && (
        <p className="mt-4 rounded-xl bg-pine-soft px-3 py-2 text-sm text-pine">
          {notice ||
            (publications.error instanceof Error
              ? publications.error.message
              : "Não foi possível carregar publicações.")}
        </p>
      )}
    </Card>
  );
}
