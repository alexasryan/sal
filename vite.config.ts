import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import config from "./site.config.json" with { type: "json" };
export default defineConfig(({ command }) => ({
  root: "site",
  publicDir: "../public",
  plugins: [react()],
  base: command === "serve" ? "/" : new URL(config.siteUrl).pathname,
  server: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: ["terminal.local"],
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
    allowedHosts: ["terminal.local"],
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    target: "es2020",
  },
}));
