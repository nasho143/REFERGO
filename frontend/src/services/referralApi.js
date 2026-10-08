import api from "./api";

// ==========================================
// GET ALL REFERRALS
// ==========================================

export const getReferrals = () => {
  return api.get("/referrals");
};

// ==========================================
// ADD REFERRAL
// ==========================================

export const addReferral = (data) => {
  console.log(
    "API ADD REFERRAL:",
    data
  );

  return api.post(
    "/referrals",
    data
  );
};

// ==========================================
// UPDATE REFERRAL
// ==========================================

export const updateReferral = (
  referralId,
  data
) => {
  console.log(
    "API UPDATE REFERRAL:",
    referralId,
    data
  );

  return api.put(
    `/referrals/${referralId}`,
    data
  );
};

// ==========================================
// DELETE REFERRAL
// ==========================================

export const deleteReferral = (
  referralId
) => {
  return api.delete(
    `/referrals/${referralId}`
  );
};