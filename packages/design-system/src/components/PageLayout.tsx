import type { ReactNode } from "react";

type LayoutWidth = "fluid" | "content" | "reading";
type PageLayoutProps = {
  as?: "main" | "section" | "div";
  children: ReactNode;
  width?: LayoutWidth;
  className?: string;
};

const widths: Record<LayoutWidth, string> = {
  fluid: "max-w-none",
  content: "max-w-[1600px]",
  reading: "max-w-[780px]",
};

/** Shared page shell: background, responsive gutters and an intentional content width. */
export function PageLayout({ as, children, className = "", width = "content" }: PageLayoutProps) {
  const Component = as ?? "main";
  return <Component className={`mx-auto w-full px-4 py-7 sm:px-6 sm:py-8 lg:px-8 lg:py-10 ${widths[width]} ${className}`}>{children}</Component>;
}

export function AppFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`min-h-screen bg-[var(--ui-canvas)] text-ink ${className}`}>{children}</div>;
}
