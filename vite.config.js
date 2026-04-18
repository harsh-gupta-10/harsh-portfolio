import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import vitePluginLocalAdmin from "./vite-plugin-local-admin.js";

export default defineConfig({
  plugins: [react(), tailwindcss(), vitePluginLocalAdmin()],
});