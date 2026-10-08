const express = require("express");
const router = express.Router();

const { getActivityLogs } = require("../controllers/activityLogController");
const authMiddleware = require("../middleware/authMiddleware");
const { pesoStaffAndDepartmentHead } = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, pesoStaffAndDepartmentHead, getActivityLogs);

module.exports = router;
