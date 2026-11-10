import { brandMarkSource } from "./asset.js";

export function BrandMark({ className = "", label = "Mimelie" }: { className?: string; label?: string }) {
  return <img className={`rounded-[22%] object-cover ${className}`} src={brandMarkSource} alt={label} />;
}
