const express = require("express");

const router = express.Router();

const {
  getEmployers,
  getEmployer,
  addEmployer,
  updateEmployer,
  deleteEmployer,
} = require("../controllers/employerController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  pesoStaffAndDepartmentHead,
} = require("../middleware/roleMiddleware");

// ==========================================================
// GET ALL EMPLOYERS
// PESO Staff + Department Head
// ==========================================================

router.get(
  "/",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getEmployers
);

// ==========================================================
// GET SINGLE EMPLOYER
// PESO Staff + Department Head
// ==========================================================

router.get(
  "/:employer_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getEmployer
);

// ==========================================================
// ADD EMPLOYER
// PESO Staff + Department Head
// ==========================================================

router.post(
  "/",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  addEmployer
);

// ==========================================================
// UPDATE EMPLOYER
// PESO Staff + Department Head
// ==========================================================

router.put(
  "/:employer_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  updateEmployer
);

// ==========================================================
// DELETE EMPLOYER
// PESO Staff + Department Head
// ==========================================================

router.delete(
  "/:employer_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  deleteEmployer
);

module.exports = router;