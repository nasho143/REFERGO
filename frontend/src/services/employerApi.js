import api from "./api";

// ==========================================
// GET ALL EMPLOYERS
// ==========================================
export const getEmployers = async () => {
  const response = await api.get("/employers");
  return response.data;
};

// ==========================================
// GET SINGLE EMPLOYER
// ==========================================
export const getEmployer = async (id) => {
  const response = await api.get(`/employers/${id}`);
  return response.data;
};

// ==========================================
// ADD EMPLOYER
// ==========================================
export const addEmployer = async (data) => {
  const response = await api.post("/employers", data);
  return response.data;
};

// ==========================================
// CREATE EMPLOYER
// Alias
// ==========================================
export const createEmployer = async (data) => {
  const response = await api.post("/employers", data);
  return response.data;
};

// ==========================================
// UPDATE EMPLOYER
// ==========================================
export const updateEmployer = async (id, data) => {
  const response = await api.put(`/employers/${id}`, data);
  return response.data;
};

// ==========================================
// DELETE EMPLOYER
// ==========================================
export const deleteEmployer = async (id) => {
  const response = await api.delete(`/employers/${id}`);
  return response.data;
};