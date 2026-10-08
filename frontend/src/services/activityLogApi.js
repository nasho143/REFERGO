import api from "./api";

// ======================================
// GET ACTIVITY LOGS
// ======================================
export const getActivityLogs = () => {
  return api.get("/activity-logs");
};

// ======================================
// CREATE ACTIVITY LOG
// ======================================
export const createActivityLog = (data) => {
  return api.post("/activity-logs", data);
};