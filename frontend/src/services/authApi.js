import api from "./api";

// ======================================
// LOGIN
// ======================================
export const login = (credentials) => {
  return api.post("/auth/login", credentials);
};

// ======================================
// GET PROFILE
// ======================================
export const getProfile = (id) => {
  return api.get(`/auth/profile/${id}`);
};

// ======================================
// UPDATE PROFILE
// ======================================
export const updateProfile = (id, data) => {
  return api.put(`/auth/profile/${id}`, data);
};

// ======================================
// CHANGE PASSWORD
// ======================================
export const changePassword = (id, data) => {
  return api.post(
    `/auth/change-password/${id}`,
    data
  );
};

// ======================================
// LOGOUT
// ======================================
export const logout = (data = {}) => {
  return api.post("/auth/logout", data);
};