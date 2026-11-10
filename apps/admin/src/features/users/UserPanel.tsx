import { useState } from "react";
import { Card, LoadingCard, PanelHeader, Select } from "@mimelie/design-system";
import type { UserRole } from "../../api/types";
import { useUpdateUserRole, useUsers } from "./hooks";
export function UserPanel() {
  const users = useUsers();
  const updateRole = useUpdateUserRole();
  const [notice, setNotice] = useState("");
  const change = async (id: string, role: UserRole) => {
    try {
      await updateRole.mutateAsync({ id, input: { role } });
      setNotice("Papel do usuário atualizado.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o papel.",
      );
    }
  };
  const items = users.data?.data ?? [];
  if (users.isLoading)
    return (
      <Card className="p-5 sm:p-6">
        <PanelHeader eyebrow="Acessos" title="Usuários" />
        <div className="mt-5 grid gap-2">
          <LoadingCard lines={1} />
          <LoadingCard lines={1} />
          <LoadingCard lines={1} />
        </div>
      </Card>
    );
  return (
    <Card className="p-5 sm:p-6">
      <PanelHeader
        eyebrow="Acessos"
        title="Usuários"
        description="Defina quem pode administrar a operação."
      />
      <div className="mt-5 grid gap-2">
        {items.map((item) => (
          <article
            className="flex items-center justify-between gap-4 rounded-xl border border-line p-4"
            key={item.id}
          >
            <div className="grid gap-1">
              <strong className="text-sm">{item.name || item.email}</strong>
              <small className="text-xs text-ink/50">
                {item.email} ·{" "}
                {item.emailVerifiedAt ? "verificado" : "pendente"}
              </small>
            </div>
            <Select
              aria-label={`Papel de ${item.email}`}
              className="min-w-[10rem]"
              value={item.role}
              disabled={updateRole.isPending}
              onChange={(event) =>
                void change(item.id, event.target.value as UserRole)
              }
            >
              <option value="VISITOR">Visitante</option>
              <option value="EDITOR">Editora</option>
              <option value="ADMIN">Administradora</option>
            </Select>
          </article>
        ))}
      </div>
      {(notice || users.error) && (
        <p className="mt-4 rounded-xl bg-pine-soft px-3 py-2 text-sm text-pine">
          {notice ||
            (users.error instanceof Error
              ? users.error.message
              : "Não foi possível carregar usuários.")}
        </p>
      )}
    </Card>
  );
}
