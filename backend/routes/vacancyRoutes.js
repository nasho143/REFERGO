const express = require("express");

const router = express.Router();

const {
  getVacancies,
  getVacancyById,
  addVacancy,
  updateVacancy,
  deleteVacancy,
} = require("../controllers/vacancyController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  pesoStaffAndDepartmentHead,
} = require("../middleware/roleMiddleware");

// ==========================================================
// GET ALL VACANCIES
// ==========================================================

router.get(
  "/",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getVacancies
);

// ==========================================================
// GET SINGLE VACANCY
// ==========================================================

router.get(
  "/:vacancy_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  getVacancyById
);

// ==========================================================
// ADD VACANCY
// ==========================================================

router.post(
  "/",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  addVacancy
);

// ==========================================================
// UPDATE VACANCY
// ==========================================================

router.put(
  "/:vacancy_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  updateVacancy
);

// ==========================================================
// DELETE VACANCY
// ==========================================================

router.delete(
  "/:vacancy_id",
  authMiddleware,
  pesoStaffAndDepartmentHead,
  deleteVacancy
);

module.exports = router;