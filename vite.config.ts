import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    cloudflare(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon.svg", "*.ttf"],
      manifest: {
        short_name: "Hanzi Trainer",
        description: "Hanzi Practicing Companion",
        background_color: "#E4D8B4",
        theme_color: "#56524C",
        icons: [{ src: "pwa-256.png", sizes: "256x256" }],
      },
    }),
  ],
});
