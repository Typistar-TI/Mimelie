import {
  Card,
  LoadingCard,
  MetricCard,
  PanelHeader,
} from "@mimelie/design-system";
import { useStatistics } from "./hooks";
export function StatisticsPanel() {
  const statistics = useStatistics();
  const stats = statistics.data?.data;
  if (statistics.isLoading)
    return (
      <Card className="p-5 sm:p-6">
        <PanelHeader eyebrow="Métricas" title="Estatísticas de clique" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
          <LoadingCard />
        </div>
      </Card>
    );
  return (
    <Card className="p-5 sm:p-6">
      <PanelHeader
        eyebrow="Métricas"
        title="Estatísticas de clique"
        description="Leituras protegidas e filtradas da atividade do catálogo."
      />
      {statistics.error && (
        <p className="mt-4 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
          {statistics.error instanceof Error
            ? statistics.error.message
            : "Não foi possível carregar estatísticas."}
        </p>
      )}
      {stats && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              [stats.activeOffers, "Ofertas ativas"],
              [stats.rawClicks24h, "Cliques brutos / 24h"],
              [stats.clicks24h, "Cliques filtrados / 24h"],
              [stats.visibleComments, "Comentários visíveis"],
            ].map(([value, label], index) => (
              <MetricCard
                key={String(label)}
                value={value}
                label={String(label)}
                tone={index === 0 ? "brand" : index === 2 ? "info" : "neutral"}
              />
            ))}
          </div>
          {/*
            <strong>
              {stats.activeOffers}
              <small>ofertas ativas</small>
            </strong>
            <strong>
              {stats.rawClicks24h}
              <small>cliques brutos / 24h</small>
            </strong>
            <strong>
              {stats.clicks24h}
              <small>cliques filtrados / 24h</small>
            </strong>
            <strong>
              {stats.visibleComments}
              <small>comentários visíveis</small>
            </strong>
          </div> */}
          <div className="mt-5 grid gap-2">
            {stats.clicksBySource.map((item) => (
              <article
                className="flex items-center justify-between rounded-xl border border-line p-4"
                key={item.source}
              >
                <strong className="text-sm">{item.source}</strong>
                <small className="text-xs text-ink/50">
                  {item.clicks} cliques filtrados nos últimos 30 dias
                </small>
              </article>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
