const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// In production the token secret must be set, never the built-in default.
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set. Add it to the environment variables.");
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && !process.env.FRONTEND_URL) {
  console.warn(
    "FRONTEND_URL is not set. Only localhost can call this API. " +
      "Set it to your website address (for example your Vercel URL)."
  );
}

const app = express();

// Hosting platforms such as Railway sit in front of the server: trust the address they forward.
app.set("trust proxy", 1);

// ======================================
// MIDDLEWARE
// ======================================
// Allowed browsers: local development, and the websites listed in
// FRONTEND_URL (comma separated), for example your Vercel address.
// The live website is always allowed, so the API keeps working even if
// FRONTEND_URL is missing on Railway. Add more addresses with FRONTEND_URL.
const DEFAULT_FRONTEND_ORIGINS = "https://refergo-xi.vercel.app";

const frontendOrigins = String(
  [DEFAULT_FRONTEND_ORIGINS, process.env.FRONTEND_URL].filter(Boolean).join(",")
)
  .split(",")
  .map((value) => value.trim().replace(/\/$/, ""))
  .filter(Boolean);

const allowedOrigin = (origin) =>
  !origin ||
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
  frontendOrigins.includes(origin);

app.use(
  cors({
    origin: (origin, callback) => callback(null, allowedOrigin(origin)),
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================================
// HEALTH CHECK (used by Railway)
// ======================================
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok" });
});

// ======================================
// ROUTES
// ======================================
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const employerRoutes = require("./routes/employerRoutes");
const vacancyRoutes = require("./routes/vacancyRoutes");
const applicantRoutes = require("./routes/applicantRoutes");
const referralRoutes = require("./routes/referralRoutes");
const reportRoutes = require("./routes/reportRoutes");
const userRoutes = require("./routes/userRoutes");
const followUpRoutes = require("./routes/followUpRoutes");
const employerResponseRoutes = require("./routes/employerResponseRoutes");
const approvalRoutes = require("./routes/approvalRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// ======================================
// API ROUTES
// ======================================
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/employers", employerRoutes);
app.use("/api/vacancies", vacancyRoutes);
app.use("/api/applicants", applicantRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/follow-ups", followUpRoutes);
app.use("/api/employer-responses", employerResponseRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/notifications", notificationRoutes);



// ======================================
// WEBSITE (built frontend)
// After `npm run build` in the frontend folder, this server also serves the
// website, so a single address shows the pages and the data.
// ======================================
const distPath = path.join(__dirname, "..", "frontend", "dist");

if (fs.existsSync(path.join(distPath, "index.html"))) {
  app.use(express.static(distPath));

  app.get(/^\/(?!api\/).*/, (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  console.log("Serving the website from frontend/dist");
}

// ======================================
// TEST ROUTE
// ======================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "REFERGO Backend API is running.",
  });
});

// ======================================
// 404 HANDLER
// ======================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ======================================
// ERROR HANDLER
// ======================================
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// ======================================
// SERVER
// ======================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `REFERGO Backend running on port ${PORT}`
  );
});