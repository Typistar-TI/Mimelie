import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "./Icon.js";

export type ColorTheme = "light" | "dark";
type ThemeContextValue = {
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
  toggleTheme: () => void;
};

const storageKey = "mimelie-color-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

function preferredTheme(): ColorTheme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(storageKey);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ColorTheme>(preferredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(storageKey, theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#111318" : "#f3f4f6");
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((current) => (current === "light" ? "dark" : "light")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className={`relative grid w-10 gap-1 rounded-[18px] border border-line bg-paper p-1.5 shadow-[0_2px_8px_rgba(34,42,57,.04)] ${className}`} aria-label="Aparência">
      <span aria-hidden="true" className={`pointer-events-none absolute left-1.5 top-1.5 h-7 w-7 rounded-[10px] bg-surface-subtle shadow-[0_1px_3px_rgba(34,42,57,.12)] transition-transform duration-200 ease-out ${theme === "dark" ? "translate-y-8" : "translate-y-0"}`} />
      <button
        aria-label="Usar modo claro"
        aria-pressed={theme === "light"}
        className="relative z-10 grid h-7 w-7 place-items-center rounded-[10px] text-ink/58 transition hover:text-ink"
        onClick={() => setTheme("light")}
        type="button"
      >
        <Icon name="sun" className="h-3.5 w-3.5" />
      </button>
      <button
        aria-label="Usar modo escuro"
        aria-pressed={theme === "dark"}
        className="relative z-10 grid h-7 w-7 place-items-center rounded-[10px] text-ink/58 transition hover:text-ink"
        onClick={() => setTheme("dark")}
        type="button"
      >
        <Icon name="moon" className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
