import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // cho phép tất cả các host (bao gồm cả Cloudflare Tunnel)
    allowedHosts: true,
  },
});
