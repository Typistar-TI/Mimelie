import { BrandMark } from "../brand/BrandMark.js";

export function BrandLockup({ href = "/", size = "md" }: { href?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "gap-2 px-3 py-2 text-[15px] [&_img]:h-6 [&_img]:w-6",
    md: "gap-2.5 px-3.5 py-2.5 text-[18px] [&_img]:h-7 [&_img]:w-7",
    lg: "gap-2.5 px-3.5 py-2.5 text-[22px] [&_img]:h-8 [&_img]:w-8",
  };
  return <a href={href} className={`inline-flex w-max items-center rounded-2xl bg-paper font-semibold leading-none tracking-[-.075em] shadow-[0_2px_8px_rgba(34,42,57,.04)] ${sizes[size]}`} aria-label="Mimelie, início"><BrandMark label="" /><span>mime<b>lie</b><i className="not-italic text-brand">•</i></span></a>;
}
