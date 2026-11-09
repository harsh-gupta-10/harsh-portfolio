import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import vitePluginLocalAdmin from "./vite-plugin-local-admin.js";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePluginLocalAdmin(),
    cloudflare({ viteEnvironment: { name: "worker" } }),
  ],
  environments: {
    worker: { build: { sourcemap: true } },
  },
});