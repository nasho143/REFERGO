import api from "./api";

// ==========================================
// GET ALL USERS
// ==========================================

export const getUsers = () => {
  return api.get("/users");
};

// ==========================================
// ADD USER
// ==========================================

export const addUser = (data) => {
  return api.post("/users", data);
};

// ==========================================
// UPDATE USER
// ==========================================

export const updateUser = (id, data) => {
  return api.put(`/users/${id}`, data);
};

// ==========================================
// TOGGLE USER STATUS
// ==========================================

export const toggleUserStatus = (id) => {
  return api.patch(`/users/${id}/status`);
};

// ==========================================
// DELETE USER
// ==========================================

export const deleteUser = (id) => {
  return api.delete(`/users/${id}`);
};