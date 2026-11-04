import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Vercel serves the SPA fallback; this setting keeps local preview predictable.
  server: { host: true },
});
