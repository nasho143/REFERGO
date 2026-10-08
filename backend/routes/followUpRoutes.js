const express = require("express");

const router = express.Router();

const {
  getFollowUps,
  getFollowUp,
  updateFollowUp,
  getFollowUpSummary,
} = require("../controllers/followUpController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  pesoStaffAndDepartmentHead,
} = require("../middleware/roleMiddleware");

// ==========================================================
// GET ALL FOLLOW-UPS
// ==========================================================

router.get(
  "/",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getFollowUps
);

// ==========================================================
// GET FOLLOW-UP SUMMARY
// ==========================================================

router.get(
  "/summary",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getFollowUpSummary
);

// ==========================================================
// GET SINGLE FOLLOW-UP
// ==========================================================

router.get(
  "/:referral_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getFollowUp
);

// ==========================================================
// UPDATE FOLLOW-UP
// ==========================================================

router.put(
  "/:referral_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  updateFollowUp
);

module.exports = router;