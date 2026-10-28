import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Used only by `npm run dev`: where the local backend is running.
  // Change it with VITE_DEV_API in frontend/.env if your backend uses another port.
  const devApi = env.VITE_DEV_API || "http://localhost:5000";

  // A production build must know where the backend is. Stop here, with a
  // clear message, instead of publishing a site that cannot load any data.
  if (mode === "production") {
    const api = env.VITE_API_URL;

    if (!api || /YOUR-/i.test(api)) {
      throw new Error(
        [
          "",
          "VITE_API_URL is not set for this production build.",
          "Set it to your backend address, for example:",
          "  VITE_API_URL=https://your-backend.up.railway.app",
          "in frontend/.env.production, or in Vercel > Settings > Environment Variables.",
          "(If the backend itself serves the website, use VITE_API_URL=same-origin.)",
          "",
        ].join("\n")
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],

    server: {
      host: "0.0.0.0",
      port: 5173,

      // Extra hostnames the dev server should answer to (comma separated),
      // for example when previewing through a tunnel or a shared dev domain.
      // Leave empty for normal local development.
      allowedHosts: env.VITE_ALLOWED_HOSTS
        ? env.VITE_ALLOWED_HOSTS.split(",").map((h) => h.trim()).filter(Boolean)
        : undefined,

      proxy: {
        "/api": {
          target: devApi,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
