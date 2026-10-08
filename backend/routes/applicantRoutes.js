const express = require("express");

const router = express.Router();

const {
  getApplicants,
  getApplicant,
  addApplicant,
  updateApplicant,
  deleteApplicant,
  getApplicantReferrals,
} = require("../controllers/applicantController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  pesoStaffAndDepartmentHead,
} = require("../middleware/roleMiddleware");

// ==========================================================
// GET ALL APPLICANTS
// PESO Staff + Department Head
// ==========================================================

router.get(
  "/",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getApplicants
);

// ==========================================================
// GET APPLICANT REFERRALS
// PESO Staff + Department Head
// ==========================================================

router.get(
  "/:applicant_id/referrals",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getApplicantReferrals
);

// ==========================================================
// GET SINGLE APPLICANT
// PESO Staff + Department Head
// ==========================================================

router.get(
  "/:applicant_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getApplicant
);

// ==========================================================
// ADD APPLICANT
// PESO Staff + Department Head
// ==========================================================

router.post(
  "/",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  addApplicant
);

// ==========================================================
// UPDATE APPLICANT
// PESO Staff + Department Head
// ==========================================================

router.put(
  "/:applicant_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  updateApplicant
);

// ==========================================================
// DELETE APPLICANT
// PESO Staff + Department Head
// ==========================================================

router.delete(
  "/:applicant_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  deleteApplicant
);

module.exports = router;