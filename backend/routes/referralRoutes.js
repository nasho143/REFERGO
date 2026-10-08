const express = require("express");

const router = express.Router();

const {
  getReferrals,
  addReferral,
  updateReferral,
  deleteReferral,
} = require("../controllers/referralController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  pesoStaffAndDepartmentHead,
} = require("../middleware/roleMiddleware");

// ==========================================================
// GET ALL REFERRALS
// ==========================================================

router.get(
  "/",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getReferrals
);

// ==========================================================
// ADD REFERRAL
// ==========================================================

router.post(
  "/",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  addReferral
);

// ==========================================================
// UPDATE REFERRAL
// ==========================================================

router.put(
  "/:referral_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  updateReferral
);

// ==========================================================
// DELETE REFERRAL
// ==========================================================

router.delete(
  "/:referral_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  deleteReferral
);

module.exports = router;