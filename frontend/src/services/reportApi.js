import api from "./api";

// ===============================
// GET REPORT DATA
// ===============================
export const getReports = () => {
  return api.get("/reports");
};