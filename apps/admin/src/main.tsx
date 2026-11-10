import { createRoot } from "react-dom/client";
import { MimelieQueryProvider } from "@mimelie/query";
import {
  brandFaviconSource,
  ThemeProvider,
  ToastProvider,
} from "@mimelie/design-system";
import "./tailwind.css";
import { AdminScreen } from "./features/admin/AdminScreen";

for (const rel of ["icon", "apple-touch-icon"]) {
  const link =
    document.querySelector(`link[rel="${rel}"]`) ??
    document.head.appendChild(document.createElement("link"));
  link.setAttribute("rel", rel);
  link.setAttribute("href", brandFaviconSource);
  link.setAttribute("type", "image/png");
}

if ("serviceWorker" in navigator) {
  window.addEventListener(
    "load",
    () => void navigator.serviceWorker.register("/admin/sw.js"),
  );
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <MimelieQueryProvider>
      <ToastProvider>
        <AdminScreen />
      </ToastProvider>
    </MimelieQueryProvider>
  </ThemeProvider>,
);
