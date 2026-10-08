import api from "./api";

// ==========================================================
// DEPARTMENT HEAD APPROVAL API
// ==========================================================
// The backend approvalRoutes should be mounted as:
// /api/approvals
//
// If your server mounts approvalRoutes under a different prefix,
// change APPROVAL_BASE below only.
// ==========================================================

const APPROVAL_BASE = "/approvals";

const approve = async (module, id) => {
  const response = await api.patch(
    `${APPROVAL_BASE}/${module}/${id}/approve`
  );

  return response.data;
};

const reject = async (module, id, rejection_reason) => {
  const response = await api.patch(
    `${APPROVAL_BASE}/${module}/${id}/reject`,
    { rejection_reason }
  );

  return response.data;
};

export const approveApplicant = (id) =>
  approve("applicants", id);

export const rejectApplicant = (id, reason) =>
  reject("applicants", id, reason);

export const approveEmployer = (id) =>
  approve("employers", id);

export const rejectEmployer = (id, reason) =>
  reject("employers", id, reason);

export const approveVacancy = (id) =>
  approve("vacancies", id);

export const rejectVacancy = (id, reason) =>
  reject("vacancies", id, reason);

export const approveReferral = (id) =>
  approve("referrals", id);

export const rejectReferral = (id, reason) =>
  reject("referrals", id, reason);
