import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["apple-touch-icon.png"],
      manifest: {
        name: "רשימת קניות",
        short_name: "קניות",
        description: "רשימת קניות עם סיווג אוטומטי לפי מעברים בסופר",
        theme_color: "#4C7A54",
        background_color: "#F0EAD9",
        display: "standalone",
        dir: "rtl",
        lang: "he",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  test: {
    environment: "jsdom",
  },
});