import { useState } from "react";
import {
  Alert,
  Button,
  Icon,
  NotFoundPage,
  PageLayout,
  useToast,
  WorkspaceLoading,
  WorkspaceShell,
  WorkspaceToolbar,
  type WorkspaceNavigationItem,
} from "@mimelie/design-system";
import { Dashboard } from "../dashboard/Dashboard";
import { LoginScreen } from "../auth/LoginScreen";
import { useCurrentSession, useLogout } from "../auth/hooks";
import { useOffers, useOfferFormOptions } from "../offers/hooks";
import { OfferForm } from "../offers/OfferForm";
import { useStatistics } from "../analytics/hooks";
import { CommentPanel } from "../community/CommentPanel";
import { CategoryPanel } from "../categories/CategoryPanel";
import { UserPanel } from "../users/UserPanel";
import { RoutinePanel } from "../automation/RoutinePanel";
import { IntegrationPanel } from "../integrations/IntegrationPanel";
import { PublicationPanel } from "../publishing/PublicationPanel";
import { StatisticsPanel } from "../analytics/StatisticsPanel";
import { ProductPanel } from "../products/ProductPanel";
import { ReconciliationPanel } from "../reconciliation/ReconciliationPanel";
import type { SessionUser } from "../../api/types";

type Tab =
  | "Visão geral"
  | "Ofertas"
  | "Produtos"
  | "Categorias"
  | "Comentários"
  | "Usuários"
  | "Rotinas"
  | "Integrações"
  | "Publicações"
  | "Estatísticas"
  | "Conciliação";
const tabs: Array<WorkspaceNavigationItem & { id: Tab }> = [
  { id: "Visão geral", label: "Visão geral", icon: "grid" },
  { id: "Ofertas", label: "Ofertas", icon: "tag" },
  { id: "Produtos", label: "Produtos", icon: "folder" },
  { id: "Categorias", label: "Categorias", icon: "folder" },
  { id: "Comentários", label: "Comentários", icon: "chat" },
  { id: "Usuários", label: "Usuários", icon: "users" },
  { id: "Rotinas", label: "Rotinas", icon: "refresh" },
  { id: "Integrações", label: "Integrações", icon: "link" },
  { id: "Publicações", label: "Publicações", icon: "send" },
  { id: "Estatísticas", label: "Estatísticas", icon: "chart" },
  { id: "Conciliação", label: "Conciliação", icon: "activity" },
];

export function AdminScreen() {
  const session = useCurrentSession();
  const user = session.data?.data;
  const isStaff = user?.role === "ADMIN" || user?.role === "EDITOR";

  const pathname = window.location.pathname;
  if (pathname !== "/" && pathname !== "/admin" && pathname !== "/admin/")
    return (
      <NotFoundPage
        homeHref="/"
        homeLabel="Abrir painel"
        title="Área não encontrada"
        description="Esta área do painel não existe."
      />
    );
  if (session.isLoading) return <WorkspaceLoading />;
  if (!isStaff || !user) return <LoginScreen />;

  return <AuthenticatedAdmin user={user} />;
}

function AuthenticatedAdmin({ user }: { user: SessionUser }) {
  const [tab, setTab] = useState<Tab>("Visão geral");
  const [modal, setModal] = useState(false);
  const offers = useOffers();
  const statistics = useStatistics();
  const formOptions = useOfferFormOptions();
  const logout = useLogout();
  const { showToast } = useToast();

  const logoutNow = async () => {
    await logout.mutateAsync();
    setTab("Visão geral");
  };
  const data = offers.data?.data ?? [];
  const stats = statistics.data?.data;
  const management =
    tab === "Produtos" ? (
      <ProductPanel />
    ) : tab === "Integrações" ? (
      <IntegrationPanel />
    ) : tab === "Rotinas" ? (
      <RoutinePanel />
    ) : tab === "Categorias" ? (
      <CategoryPanel />
    ) : tab === "Usuários" ? (
      <UserPanel />
    ) : tab === "Publicações" ? (
      <PublicationPanel />
    ) : tab === "Estatísticas" ? (
      <StatisticsPanel />
    ) : tab === "Conciliação" ? (
      <ReconciliationPanel />
    ) : (
      <CommentPanel />
    );

  return (
    <WorkspaceShell
      items={tabs}
      activeItem={tab}
      onNavigate={(id) => setTab(id as Tab)}
      headerActions={
        tab === "Ofertas" ? (
          <Button size="sm" leading={<Icon name="tag" />} onClick={() => setModal(true)}>
            Cadastrar oferta
          </Button>
        ) : null
      }
      toolbar={
        <WorkspaceToolbar
          onSearch={(query) =>
            showToast({
              title: `Pesquisa por “${query}”`,
              description: "A pesquisa global estará disponível conforme novas áreas forem indexadas.",
            })
          }
          onSignOut={() => void logoutNow()}
          signOutPending={logout.isPending}
          user={{
            email: user.email,
            name: user.name,
            roleLabel: user.role === "ADMIN" ? "Administradora" : "Editora",
          }}
        />
      }
    >
      <PageLayout as="section" width="fluid">
            {(offers.error || statistics.error) && (
              <Alert className="mb-5" tone="error" title="Falha ao atualizar o painel">
                {offers.error instanceof Error
                  ? offers.error.message
                  : statistics.error instanceof Error
                    ? statistics.error.message
                    : "Falha ao atualizar o painel."}
              </Alert>
            )}
            {(offers.isLoading || statistics.isLoading) &&
            (tab === "Visão geral" || tab === "Ofertas") ? (
              <WorkspaceLoading />
            ) : tab === "Visão geral" || tab === "Ofertas" ? (
              <Dashboard offers={data} statistics={stats!} />
            ) : (
              management
            )}
      </PageLayout>
      <OfferForm
          open={modal}
          loading={formOptions.isLoading}
          stores={formOptions.data?.stores ?? []}
          categories={formOptions.data?.categories ?? []}
          onCancel={() => setModal(false)}
          onSaved={() => setModal(false)}
      />
    </WorkspaceShell>
  );
}
