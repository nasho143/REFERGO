const express = require("express");
const router = express.Router();
const { getReports } = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const { pesoStaffAndDepartmentHead } = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, pesoStaffAndDepartmentHead, getReports);

module.exports = router;
