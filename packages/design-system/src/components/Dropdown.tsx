import {
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

export type DropdownTriggerProps = Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-controls" | "aria-expanded" | "aria-haspopup" | "onClick"
>;

export function Dropdown({
  label,
  trigger,
  children,
  align = "right",
  className = "",
}: {
  label: string;
  trigger: (props: DropdownTriggerProps, open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panelId = `dropdown-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={root}>
      {trigger(
        {
          "aria-controls": panelId,
          "aria-expanded": open,
          "aria-haspopup": "menu",
          onClick: () => setOpen((current) => !current),
        },
        open,
      )}
      {open && (
        <section
          aria-label={label}
          className={`absolute top-[calc(100%+10px)] z-40 min-w-[220px] overflow-hidden rounded-[18px] border border-line bg-paper p-1.5 shadow-[0_18px_40px_rgba(24,31,44,.16)] ${align === "right" ? "right-0" : "left-0"} ${className}`}
          id={panelId}
          role="menu"
        >
          {children(close)}
        </section>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded-[13px] px-3 py-2.5 text-left text-xs font-medium text-ink/72 transition hover:bg-surface-subtle hover:text-ink disabled:pointer-events-none disabled:opacity-45 ${className}`}
      role="menuitem"
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
