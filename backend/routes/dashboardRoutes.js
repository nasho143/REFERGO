const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const { pesoStaffAndDepartmentHead } = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, pesoStaffAndDepartmentHead, getDashboard);

module.exports = router;
