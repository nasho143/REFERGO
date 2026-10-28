const express = require("express");
const router = express.Router();

const { getActivityLogs } = require("../controllers/activityLogController");
const authMiddleware = require("../middleware/authMiddleware");
const { departmentHeadOnly } = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, departmentHeadOnly, getActivityLogs);

module.exports = router;
