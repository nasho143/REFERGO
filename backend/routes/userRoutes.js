const express = require("express");

const router = express.Router();

const {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  departmentHeadOnly,
} = require("../middleware/roleMiddleware");

// ==========================================================
// USER MANAGEMENT
// DEPARTMENT HEAD ONLY
// ==========================================================

router.get(
  "/",
  authMiddleware,
  departmentHeadOnly,
  getUsers
);

router.post(
  "/",
  authMiddleware,
  departmentHeadOnly,
  addUser
);

router.put(
  "/:id",
  authMiddleware,
  departmentHeadOnly,
  updateUser
);

router.patch(
  "/:id/status",
  authMiddleware,
  departmentHeadOnly,
  toggleUserStatus
);

router.delete(
  "/:id",
  authMiddleware,
  departmentHeadOnly,
  deleteUser
);

module.exports = router;