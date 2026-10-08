const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ======================================
// MIDDLEWARE
// ======================================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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