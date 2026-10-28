import api from "./api";

// params: { mode: "day" | "week" | "month", date: "YYYY-MM-DD" | "YYYY-Www" | "YYYY-MM" }
export const getDashboard = (params = {}) => {
  return api.get("/dashboard", { params });
};

export const getNotifications = () => {
  return api.get("/notifications");
};
