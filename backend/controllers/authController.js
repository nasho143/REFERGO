const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==========================================================
// ACTIVITY LOG HELPER
// ==========================================================

const getIpAddress = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return String(forwardedFor).split(",")[0].trim();
  }

  return (
    req.ip ||
    req.socket?.remoteAddress ||
    null
  );
};

const createActivityLog = async ({
  userId = null,
  username = null,
  module,
  activity,
  ipAddress = null,
}) => {
  try {
    await db.query(
      `
      INSERT INTO activity_logs
      (
        user_id,
        username,
        module,
        activity,
        ip_address
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        userId,
        username,
        module,
        activity,
        ipAddress,
      ]
    );
  } catch (error) {
    console.error(
      "CREATE ACTIVITY LOG ERROR:",
      error
    );

    // Activity logging should never stop
    // the main operation from succeeding.
  }
};

// ==========================================================
// LOGIN
// ==========================================================

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // ==========================================
    // VALIDATE INPUT
    // ==========================================

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const cleanUsername = username.trim();

    // ==========================================
    // FIND USER
    // ==========================================

    const [results] = await db.query(
      `
      SELECT
        id,
        full_name,
        username,
        email,
        password,
        role,
        status
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
      [cleanUsername]
    );

    // ==========================================
    // USER NOT FOUND
    // ==========================================

    if (!results || results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const user = results[0];

    // ==========================================
    // CHECK ACCOUNT STATUS
    // ==========================================

    if (
      user.status &&
      user.status !== "active"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "This account is inactive. Please contact the administrator.",
      });
    }

    // ==========================================
    // CHECK PASSWORD
    // ==========================================

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // ==========================================
    // CREATE JWT TOKEN
    // ==========================================

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET ||
        "refergo_secret_key",
      {
        expiresIn: "1d",
      }
    );

    // ==========================================
    // USER DATA FOR FRONTEND
    // ==========================================

    const userData = {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    // ==========================================
    // ACTIVITY LOG
    // ==========================================

    await createActivityLog({
      userId: user.id,
      username: user.username,
      module: "Authentication",
      activity: `User ${user.username} logged in.`,
      ipAddress: getIpAddress(req),
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: userData,
    });
  } catch (error) {
    console.error(
      "=========================================="
    );
    console.error("LOGIN ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error(
      "SQL MESSAGE:",
      error.sqlMessage
    );
    console.error(
      "SQL STATE:",
      error.sqlState
    );
    console.error(
      "=========================================="
    );

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// ==========================================================
// GET USER PROFILE
// ==========================================================

exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [results] = await db.query(
      `
      SELECT
        id,
        full_name,
        username,
        email,
        role,
        status,
        created_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: results[0],
    });
  } catch (error) {
    console.error(
      "=========================================="
    );
    console.error("GET PROFILE ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error(
      "SQL MESSAGE:",
      error.sqlMessage
    );
    console.error(
      "=========================================="
    );

    return res.status(500).json({
      success: false,
      message: "Database error.",
    });
  }
};

// ==========================================================
// UPDATE USER PROFILE
// ==========================================================

exports.updateProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      full_name,
      username,
      email,
    } = req.body;

    // ==========================================
    // VALIDATE INPUT
    // ==========================================

    if (!full_name || !username) {
      return res.status(400).json({
        success: false,
        message:
          "Full name and username are required.",
      });
    }

    const cleanFullName = full_name.trim();
    const cleanUsername = username.trim();

    const cleanEmail =
      email && email.trim() !== ""
        ? email.trim()
        : null;

    // ==========================================
    // CHECK DUPLICATE USERNAME
    // ==========================================

    const [checkResults] = await db.query(
      `
      SELECT
        id
      FROM users
      WHERE username = ?
      AND id != ?
      LIMIT 1
      `,
      [cleanUsername, id]
    );

    if (checkResults.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username is already in use.",
      });
    }

    // ==========================================
    // UPDATE PROFILE
    // ==========================================

    const [result] = await db.query(
      `
      UPDATE users
      SET
        full_name = ?,
        username = ?,
        email = ?
      WHERE id = ?
      `,
      [
        cleanFullName,
        cleanUsername,
        cleanEmail,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ==========================================
    // ACTIVITY LOG
    // ==========================================

    const loggedInUserId =
      req.user?.id || id;

    const loggedInUsername =
      req.user?.username ||
      cleanUsername;

    await createActivityLog({
      userId: loggedInUserId,
      username: loggedInUsername,
      module: "User Profile",
      activity:
        `User ${loggedInUsername} updated their profile.`,
      ipAddress: getIpAddress(req),
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error(
      "=========================================="
    );
    console.error("UPDATE PROFILE ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error(
      "SQL MESSAGE:",
      error.sqlMessage
    );
    console.error(
      "=========================================="
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};

// ==========================================================
// CHANGE PASSWORD
// ==========================================================

exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      currentPassword,
      newPassword,
    } = req.body;

    // ==========================================
    // VALIDATE INPUT
    // ==========================================

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required.",
      });
    }

    // ==========================================
    // PASSWORD LENGTH
    // ==========================================

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters long.",
      });
    }

    // ==========================================
    // GET CURRENT PASSWORD
    // ==========================================

    const [results] = await db.query(
      `
      SELECT
        id,
        username,
        password
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = results[0];

    // ==========================================
    // CHECK CURRENT PASSWORD
    // ==========================================

    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    // ==========================================
    // HASH NEW PASSWORD
    // ==========================================

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    // ==========================================
    // UPDATE PASSWORD
    // ==========================================

    const [result] = await db.query(
      `
      UPDATE users
      SET password = ?
      WHERE id = ?
      `,
      [hashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ==========================================
    // ACTIVITY LOG
    // ==========================================

    const loggedInUserId =
      req.user?.id || user.id;

    const loggedInUsername =
      req.user?.username ||
      user.username;

    await createActivityLog({
      userId: loggedInUserId,
      username: loggedInUsername,
      module: "Authentication",
      activity:
        `User ${loggedInUsername} changed their password.`,
      ipAddress: getIpAddress(req),
    });

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully.",
    });
  } catch (error) {
    console.error(
      "=========================================="
    );
    console.error("CHANGE PASSWORD ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error(
      "SQL MESSAGE:",
      error.sqlMessage
    );
    console.error(
      "=========================================="
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while changing password.",
    });
  }
};

// ==========================================================
// LOGOUT
// ==========================================================

exports.logout = async (req, res) => {
  try {
    // ==========================================
    // GET USER INFORMATION
    // ==========================================

    const userId =
      req.user?.id ||
      req.body?.user_id ||
      null;

    const username =
      req.user?.username ||
      req.body?.username ||
      null;

    // ==========================================
    // ACTIVITY LOG
    // ==========================================

    if (userId || username) {
      await createActivityLog({
        userId,
        username,
        module: "Authentication",
        activity:
          username
            ? `User ${username} logged out.`
            : `User ID ${userId} logged out.`,
        ipAddress: getIpAddress(req),
      });
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error(
      "=========================================="
    );
    console.error("LOGOUT ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error(
      "=========================================="
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error during logout.",
    });
  }
};