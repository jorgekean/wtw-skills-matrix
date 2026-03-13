import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { powerApps } from "@microsoft/power-apps-vite/plugin"
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), powerApps(), tailwindcss(),],
  base: './',
  server: {
    port: 5174,
    proxy: {
      // This tells Vite to forward all Dataverse API calls to your cloud environment
      '/api': {
        target: 'https://orgf219f9c1.crm.dynamics.com', // <-- REPLACE THIS!
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
