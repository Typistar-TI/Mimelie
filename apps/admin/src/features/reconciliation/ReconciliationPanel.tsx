import { useMutation } from "@tanstack/react-query";
import { useState, type ChangeEvent } from "react";
import {
  Button,
  Card,
  Field,
  PanelHeader,
  Textarea,
  useToast,
} from "@mimelie/design-system";
import { applyReconciliation } from "../../api/features/reconciliation/apply";
import {
  previewReconciliation,
  type ReconciliationEntry,
} from "../../api/features/reconciliation/preview";

const brl = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );

const confidenceLabel: Record<ReconciliationEntry["confidence"], string> = {
  high: "Alta",
  medium: "Média",
  ambiguous: "Ambígua",
  none: "Sem par",
};

export function ReconciliationPanel() {
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<ReconciliationEntry[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState("");
  const { showToast } = useToast();
  const preview = useMutation({ mutationFn: previewReconciliation });
  const apply = useMutation({ mutationFn: applyReconciliation });

  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setContent(await file.text());
    setEntries([]);
    setSelected(new Set());
  };

  const check = async () => {
    try {
      const result = await preview.mutateAsync(content);
      setEntries(result.data.entries);
      setSelected(
        new Set(
          result.data.entries
            .filter((entry) => entry.orderId)
            .map((entry) => entry.externalId),
        ),
      );
      setNotice(
        `${result.data.summary.matched} de ${result.data.summary.total} lançamentos encontraram um pedido.`,
      );
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível ler o extrato.",
      );
    }
  };

  const confirm = async () => {
    const matches = entries
      .filter((entry) => entry.orderId && selected.has(entry.externalId))
      .map((entry) => ({
        orderId: entry.orderId!,
        externalId: entry.externalId,
      }));
    if (!matches.length) return;
    try {
      const result = await apply.mutateAsync({ matches });
      const message = `${result.data.applied} pedido(s) confirmado(s), ${result.data.skipped} ignorado(s).`;
      setNotice(message);
      showToast({ title: "Conciliação concluída", description: message });
      setEntries([]);
      setSelected(new Set());
      setContent("");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Não foi possível conciliar.",
      );
    }
  };

  const toggle = (externalId: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(externalId)) next.delete(externalId);
      else next.add(externalId);
      return next;
    });
  };

  return (
    <Card className="p-5 sm:p-6">
      <PanelHeader
        eyebrow="Financeiro"
        title="Conciliação de PIX"
        description="Cole o OFX ou CSV do banco. A gente encontra o pedido pelo número ou pelo valor e confirma o pagamento."
      />
      <div className="mt-5 grid gap-4">
        <Field label="Arquivo do extrato" hint="OFX ou CSV exportado pelo banco.">
          <input
            accept=".ofx,.csv,text/plain,text/csv"
            className="block w-full text-sm"
            type="file"
            onChange={readFile}
          />
        </Field>
        <Field label="Ou cole o conteúdo">
          <Textarea
            className="min-h-40 font-mono text-xs"
            placeholder="<OFX>… ou data;valor;descrição"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            disabled={content.trim().length < 10 || preview.isPending}
            onClick={check}
          >
            {preview.isPending ? "Conferindo…" : "Conferir extrato"}
          </Button>
          <Button
            disabled={!selected.size || apply.isPending}
            variant="secondary"
            onClick={confirm}
          >
            {apply.isPending
              ? "Confirmando…"
              : `Confirmar ${selected.size} pagamento(s)`}
          </Button>
        </div>
        {notice ? (
          <p className="rounded-[14px] bg-brand-soft px-4 py-3 text-sm text-ink">
            {notice}
          </p>
        ) : null}
      </div>

      {entries.length ? (
        <div className="mt-7 overflow-x-auto rounded-[16px] border border-line">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface-subtle text-[10px] uppercase tracking-[.14em] text-ink/55">
              <tr>
                <th className="px-3 py-3"> </th>
                <th className="px-3 py-3">Pedido</th>
                <th className="px-3 py-3">Valor</th>
                <th className="px-3 py-3">Data</th>
                <th className="px-3 py-3">Descrição</th>
                <th className="px-3 py-3">Confiança</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr className="border-t border-line" key={entry.externalId}>
                  <td className="px-3 py-3">
                    <input
                      checked={selected.has(entry.externalId)}
                      disabled={!entry.orderId}
                      type="checkbox"
                      onChange={() => toggle(entry.externalId)}
                    />
                  </td>
                  <td className="px-3 py-3 font-mono text-xs">
                    {entry.orderNumber ?? "—"}
                  </td>
                  <td className="px-3 py-3">{brl(entry.amountCents)}</td>
                  <td className="px-3 py-3">{entry.date ?? "—"}</td>
                  <td className="max-w-[280px] truncate px-3 py-3">
                    {entry.description}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        entry.confidence === "high"
                          ? "bg-pine-soft text-pine"
                          : entry.confidence === "medium"
                            ? "bg-amber-soft text-amber"
                            : "bg-ink/6 text-ink/50"
                      }`}
                    >
                      {confidenceLabel[entry.confidence]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  );
}
