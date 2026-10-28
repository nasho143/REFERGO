import axios from "axios";

// Where the backend lives:
//  - local development / one-server hosting: same address, "/api"
//  - Vercel (frontend) + Railway (backend): set VITE_API_URL to the Railway
//    address, for example https://refergo-backend.up.railway.app
//  - the backend also serves the website (npm run build, then npm start):
//    set VITE_API_URL=same-origin
const RAW_API_URL = String(import.meta.env.VITE_API_URL || "").trim();
// A trailing "/api" is removed on purpose: older deployments set
// VITE_API_URL=https://.../api, and "/api" is added again below.
const API_ORIGIN =
  RAW_API_URL === "same-origin"
    ? ""
    : RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/i, "");

// A production build with no backend address would call the website itself.
if (
  import.meta.env.PROD &&
  !RAW_API_URL &&
  typeof window !== "undefined" &&
  !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
) {
  console.warn(
    "VITE_API_URL is not set. Set it to your backend address (for example the Railway URL) and redeploy."
  );
}

const headers = { "Content-Type": "application/json" };

const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  headers,
});

// ==========================================
// REQUEST INTERCEPTOR
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================
api.interceptors.response.use(
  (response) => {
    // A web page where data was expected (for example a hosting error page).
    if (
      typeof response.data === "string" &&
      response.data.trim().startsWith("<")
    ) {
      console.error(
        "API returned a web page instead of data:",
        response.config?.url
      );
    }

    return response;
  },
  (error) => {
    console.error(
      "API ERROR:",
      error.response?.status,
      error.config?.url,
      error.response?.data
    );

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;