import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET ?? "http://127.0.0.1:8080";

  return {
    server: {
      host: "::",
      port: 5173,
      hmr: {
        overlay: false,
      },
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
          navigateFallback: "index.html",
        },
        manifest: {
          name: "Logistics Routes – Conductor",
          short_name: "Mis Rutas",
          description: "Gestión de rutas y entregas para conductores",
          theme_color: "#0a1628",
          background_color: "#0a1628",
          display: "standalone",
          orientation: "portrait",
          icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
