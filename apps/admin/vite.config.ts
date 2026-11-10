import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const apiTarget = process.env.API_URL ?? "http://localhost:8788";

export default defineConfig({
  base: '/admin/',
  plugins: [tailwindcss(), react()],
  server: {
    port: 5174,
    proxy: {
      "/v1": { target: apiTarget, changeOrigin: true },
    },
  },
});
