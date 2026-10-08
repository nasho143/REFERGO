const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { departmentHeadOnly } = require("../middleware/roleMiddleware");

const {
  approveApplicant,
  rejectApplicant,
  approveEmployer,
  rejectEmployer,
  approveVacancy,
  rejectVacancy,
  approveReferral,
  rejectReferral,
} = require("../controllers/approvalController");

// ==========================================================
// DEPARTMENT HEAD APPROVAL ROUTES
// ==========================================================

// Applicants
router.patch(
  "/applicants/:id/approve",
  authMiddleware,
  departmentHeadOnly,
  approveApplicant
);

router.patch(
  "/applicants/:id/reject",
  authMiddleware,
  departmentHeadOnly,
  rejectApplicant
);

// Employers
router.patch(
  "/employers/:id/approve",
  authMiddleware,
  departmentHeadOnly,
  approveEmployer
);

router.patch(
  "/employers/:id/reject",
  authMiddleware,
  departmentHeadOnly,
  rejectEmployer
);

// Job Vacancies
router.patch(
  "/vacancies/:id/approve",
  authMiddleware,
  departmentHeadOnly,
  approveVacancy
);

router.patch(
  "/vacancies/:id/reject",
  authMiddleware,
  departmentHeadOnly,
  rejectVacancy
);

// Referrals
router.patch(
  "/referrals/:id/approve",
  authMiddleware,
  departmentHeadOnly,
  approveReferral
);

router.patch(
  "/referrals/:id/reject",
  authMiddleware,
  departmentHeadOnly,
  rejectReferral
);

module.exports = router;
