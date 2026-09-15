import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),

    VitePWA({
      registerType: "prompt",

      manifest: {
        name: "Daily Word",
        short_name: "Daily Word",
        description:
          "Build a daily Bible reading habit, track your progress, and grow at your own pace.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
  {
    src: "/book.svg",
    sizes: "800x800",
    type: "image/svg+xml",
  },
],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": "/src",
    },
  },
});