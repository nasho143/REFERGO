import api from "./api";

// ==========================================================
// GET ALL APPLICANTS
// ==========================================================

export const getApplicants = async () => {
  const response = await api.get("/applicants");

  return response.data;
};


// ==========================================================
// GET SINGLE APPLICANT
// ==========================================================

export const getApplicant = async (id) => {
  const response = await api.get(
    `/applicants/${id}`
  );

  return response.data;
};


// ==========================================================
// GET APPLICANT REFERRALS
// ==========================================================

export const getApplicantReferrals = async (id) => {
  const response = await api.get(
    `/applicants/${id}/referrals`
  );

  return response.data;
};


// ==========================================================
// ADD APPLICANT
// ==========================================================

export const addApplicant = async (data) => {
  const response = await api.post(
    "/applicants",
    data
  );

  return response.data;
};


// ==========================================================
// CREATE APPLICANT
// Alias for addApplicant
// ==========================================================

export const createApplicant = async (data) => {
  const response = await api.post(
    "/applicants",
    data
  );

  return response.data;
};


// ==========================================================
// UPDATE APPLICANT
// ==========================================================

export const updateApplicant = async (
  id,
  data
) => {
  const response = await api.put(
    `/applicants/${id}`,
    data
  );

  return response.data;
};


// ==========================================================
// DELETE APPLICANT
// ==========================================================

export const deleteApplicant = async (id) => {
  const response = await api.delete(
    `/applicants/${id}`
  );

  return response.data;
};