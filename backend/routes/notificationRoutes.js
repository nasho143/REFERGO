const express = require("express");
const router = express.Router();

const { getNotifications } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");
const { pesoStaffAndDepartmentHead } = require("../middleware/roleMiddleware");

router.get("/", authMiddleware, pesoStaffAndDepartmentHead, getNotifications);

module.exports = router;
