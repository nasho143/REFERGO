const express = require("express");

const router = express.Router();

const {
  getEmployerResponses,
  getEmployerResponseSummary,
  getEmployerResponse,
  updateEmployerResponse,
} = require("../controllers/employerResponseController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  pesoStaffAndDepartmentHead,
} = require("../middleware/roleMiddleware");

// ==========================================================
// GET EMPLOYER RESPONSES
// ==========================================================

router.get(
  "/",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getEmployerResponses
);

// ==========================================================
// GET SUMMARY
// ==========================================================

router.get(
  "/summary",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getEmployerResponseSummary
);

// ==========================================================
// GET SINGLE RESPONSE
// ==========================================================

router.get(
  "/:referral_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getEmployerResponse
);

// ==========================================================
// UPDATE RESPONSE
// ==========================================================

router.put(
  "/:referral_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  updateEmployerResponse
);

module.exports = router;