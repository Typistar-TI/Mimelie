import { useEffect, useRef, useState } from "react";
import { Avatar } from "./Avatar.js";
import { Dropdown, DropdownItem } from "./Dropdown.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { Input } from "./FormControls.js";

export type WorkspaceUser = {
  name?: string | null;
  email: string;
  roleLabel: string;
};

export function WorkspaceToolbar({
  user,
  onSearch,
  onSignOut,
  signOutPending = false,
}: {
  user: WorkspaceUser;
  onSearch: (query: string) => void;
  onSignOut: () => void;
  signOutPending?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const displayName = user.name || user.email;

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

  return (
    <div className="flex items-center gap-2">
      <form
        className={`flex h-9 items-center overflow-hidden rounded-[14px] border bg-paper transition-[width,opacity,transform,padding] duration-200 ease-out ${searchOpen ? "w-[min(19rem,calc(100vw-13rem))] translate-x-0 border-line px-1.5 opacity-100" : "pointer-events-none w-0 -translate-x-2 border-transparent px-0 opacity-0"}`}
        onSubmit={(event) => {
          event.preventDefault();
          const value = query.trim();
          if (value) onSearch(value);
          setSearchOpen(false);
        }}
      >
        <Input
          ref={searchInput}
          className="min-h-0 min-w-0 flex-1 border-0 bg-transparent px-2 py-1.5 text-xs shadow-none focus:ring-0"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ofertas, pessoas…"
          value={query}
        />
        <button aria-label="Enviar pesquisa" className="grid h-7 w-7 shrink-0 place-items-center rounded-[10px] text-ink/52 transition hover:bg-surface-subtle hover:text-brand" type="submit">
          <Icon name="search" className="h-3.5 w-3.5" />
        </button>
      </form>
      <IconButton aria-expanded={searchOpen} label="Pesquisar no painel" onClick={() => setSearchOpen((open) => !open)}>
        <Icon name="search" />
      </IconButton>

      <Dropdown
        label="Notificações"
        trigger={(props) => (
          <IconButton {...props} label="Notificações" className="relative">
            <Icon name="bell" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand ring-2 ring-paper" />
          </IconButton>
        )}
      >
        {() => (
          <div className="p-2.5">
            <p className="text-xs font-semibold text-ink">Notificações</p>
            <p className="mt-1 text-[11px] leading-5 text-ink/55">
              Nenhuma atualização exige sua atenção agora.
            </p>
          </div>
        )}
      </Dropdown>

      <Dropdown
        label="Conta"
        className="min-w-[238px]"
        trigger={(props) => (
          <button
            {...props}
            className="flex min-h-10 items-center gap-2 rounded-[16px] border border-transparent bg-paper px-1.5 pr-2.5 text-left shadow-[0_2px_8px_rgba(34,42,57,.04)] transition hover:border-line hover:bg-surface-subtle"
            type="button"
          >
            <Avatar
              className="!bg-[linear-gradient(135deg,#ff9d83,#ee4d2d)] !text-white"
              name={displayName}
              size="sm"
            />
            <span className="hidden min-w-0 leading-tight sm:grid">
              <strong className="max-w-[108px] truncate text-[10px] font-semibold text-ink">
                {displayName}
              </strong>
              <small className="mt-0.5 text-[9px] text-ink/48">{user.roleLabel}</small>
            </span>
            <Icon name="chevronDown" className="h-3.5 w-3.5 text-ink/46" />
          </button>
        )}
      >
        {(close) => (
          <>
            <div className="border-b border-line px-3 py-2.5">
              <strong className="block truncate text-xs text-ink">{displayName}</strong>
              <span className="mt-0.5 block truncate text-[11px] text-ink/52">{user.email}</span>
            </div>
            <div className="p-1">
              <DropdownItem
                className="text-danger hover:bg-danger-soft hover:text-danger"
                disabled={signOutPending}
                onClick={() => {
                  close();
                  onSignOut();
                }}
              >
                {signOutPending ? "Saindo…" : "Sair da conta"}
              </DropdownItem>
            </div>
          </>
        )}
      </Dropdown>
    </div>
  );
}
