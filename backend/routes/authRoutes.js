const express = require("express");
const router = express.Router();

const {
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/login", login);
router.get("/profile/:id", authMiddleware, getProfile);
router.put("/profile/:id", authMiddleware, updateProfile);
router.post("/change-password/:id", authMiddleware, changePassword);
router.post("/logout", authMiddleware, logout);

module.exports = router;
