const db = require("../config/db");
const bcrypt = require("bcrypt");

// ==========================================
// ACTIVITY LOG HELPER
// ==========================================

function getIpAddress(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return String(forwardedFor)
      .split(",")[0]
      .trim();
  }

  return (
    req.ip ||
    req.socket?.remoteAddress ||
    null
  );
}

function createActivityLog(
  req,
  module,
  activity
) {
  const userId =
    req.user?.id || null;

  const username =
    req.user?.username || null;

  const ipAddress =
    getIpAddress(req);

  return db
    .query(
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
    )
    .catch((error) => {
      console.error(
        "USER MANAGEMENT ACTIVITY LOG ERROR:",
        error
      );
    });
}

// ==========================================
// GET ALL USERS
// ==========================================

const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        full_name,
        username,
        email,
        role,
        status,
        created_at
      FROM users
      ORDER BY id DESC
    `);

    return res.json({
      success: true,
      users: rows,
    });
  } catch (error) {
    console.error("==========================================");
    console.error("GET USERS ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error("SQL MESSAGE:", error.sqlMessage);
    console.error("SQL STATE:", error.sqlState);
    console.error("==========================================");

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users.",
    });
  }
};

// ==========================================
// ADD USER
// ==========================================

const addUser = async (req, res) => {
  try {
    const {
      full_name,
      username,
      email,
      password,
      role,
      status,
    } = req.body;

    console.log("==========================================");
    console.log("ADD USER REQUEST");
    console.log("BODY:", {
      full_name,
      username,
      email,
      role,
      status,
      passwordProvided: Boolean(password),
    });
    console.log("==========================================");

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!full_name || !username || !password || !role) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, username, password, and role are required.",
      });
    }

    // ==========================================
    // ALLOWED ROLES
    // ==========================================

    const allowedRoles = [
      "peso_staff",
      "department_head",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // ==========================================
    // FINAL STATUS
    // ==========================================

    const finalStatus =
      status === "inactive"
        ? "inactive"
        : "active";

    // ==========================================
    // CLEAN VALUES
    // ==========================================

    const cleanFullName = full_name.trim();
    const cleanUsername = username.trim();

    const cleanEmail =
      email && email.trim() !== ""
        ? email.trim()
        : null;

    // ==========================================
    // CHECK DUPLICATE USERNAME
    // ==========================================

    const [existingUser] = await db.query(
      `
      SELECT
        id
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
      [cleanUsername]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username already exists.",
      });
    }

    // ==========================================
    // CHECK DUPLICATE EMAIL
    // ==========================================

    if (cleanEmail) {
      const [existingEmail] = await db.query(
        `
        SELECT
          id
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [cleanEmail]
      );

      if (existingEmail.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }
    }

    // ==========================================
    // HASH PASSWORD
    // ==========================================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // ==========================================
    // INSERT USER
    // ==========================================

    const [result] = await db.query(
      `
      INSERT INTO users
      (
        full_name,
        username,
        email,
        password,
        role,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        cleanFullName,
        cleanUsername,
        cleanEmail,
        hashedPassword,
        role,
        finalStatus,
      ]
    );

    // ==========================================
    // ACTIVITY LOG
    // ==========================================

    await createActivityLog(
      req,
      "User Management",
      `Added user: ${cleanUsername}.`
    );

    // ==========================================
    // SUCCESS
    // ==========================================

    console.log(
      "USER CREATED SUCCESSFULLY:",
      result.insertId
    );

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      user: {
        id: result.insertId,
        full_name: cleanFullName,
        username: cleanUsername,
        email: cleanEmail,
        role,
        status: finalStatus,
      },
    });
  } catch (error) {
    console.error("==========================================");
    console.error("ADD USER ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error("SQL MESSAGE:", error.sqlMessage);
    console.error("SQL STATE:", error.sqlState);
    console.error("STACK:", error.stack);
    console.error("==========================================");

    return res.status(500).json({
      success: false,
      message:
        error.sqlMessage ||
        error.message ||
        "Failed to create user.",
    });
  }
};

// ==========================================
// UPDATE USER
// ==========================================

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      full_name,
      username,
      email,
      role,
      status,
      password,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!full_name || !username || !role) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, username, and role are required.",
      });
    }

    // ==========================================
    // ALLOWED ROLES
    // ==========================================

    const allowedRoles = [
      "peso_staff",
      "department_head",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role.",
      });
    }

    // ==========================================
    // STATUS
    // ==========================================

    const finalStatus =
      status === "inactive"
        ? "inactive"
        : "active";

    // ==========================================
    // CHECK USER EXISTS
    // ==========================================

    const [existingUser] = await db.query(
      `
      SELECT
        id,
        full_name,
        username,
        email,
        role,
        status
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const oldUser = existingUser[0];

    // ==========================================
    // CLEAN VALUES
    // ==========================================

    const cleanFullName = full_name.trim();
    const cleanUsername = username.trim();

    const cleanEmail =
      email && email.trim() !== ""
        ? email.trim()
        : null;

    // ==========================================
    // CHECK DUPLICATE USERNAME
    // ==========================================

    const [duplicateUsername] = await db.query(
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

    if (duplicateUsername.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Username already exists.",
      });
    }

    // ==========================================
    // CHECK DUPLICATE EMAIL
    // ==========================================

    if (cleanEmail) {
      const [duplicateEmail] = await db.query(
        `
        SELECT
          id
        FROM users
        WHERE email = ?
        AND id != ?
        LIMIT 1
        `,
        [cleanEmail, id]
      );

      if (duplicateEmail.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }
    }

    // ==========================================
    // CHECK CHANGES
    // ==========================================

    const passwordChanged =
      Boolean(password) &&
      password.trim() !== "";

    const roleChanged =
      oldUser.role !== role;

    const statusChanged =
      oldUser.status !== finalStatus;

    // ==========================================
    // UPDATE WITH PASSWORD
    // ==========================================

    let query;
    let values;

    if (passwordChanged) {
      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      query = `
        UPDATE users
        SET
          full_name = ?,
          username = ?,
          email = ?,
          password = ?,
          role = ?,
          status = ?
        WHERE id = ?
      `;

      values = [
        cleanFullName,
        cleanUsername,
        cleanEmail,
        hashedPassword,
        role,
        finalStatus,
        id,
      ];
    } else {
      // ==========================================
      // UPDATE WITHOUT PASSWORD
      // ==========================================

      query = `
        UPDATE users
        SET
          full_name = ?,
          username = ?,
          email = ?,
          role = ?,
          status = ?
        WHERE id = ?
      `;

      values = [
        cleanFullName,
        cleanUsername,
        cleanEmail,
        role,
        finalStatus,
        id,
      ];
    }

    await db.query(query, values);

    // ==========================================
    // ACTIVITY LOG - GENERAL UPDATE
    // ==========================================

    await createActivityLog(
      req,
      "User Management",
      `Updated user: ${cleanUsername}.`
    );

    // ==========================================
    // ACTIVITY LOG - PASSWORD CHANGE
    // ==========================================

    if (passwordChanged) {
      await createActivityLog(
        req,
        "User Management",
        `Changed password for user: ${cleanUsername}.`
      );
    }

    // ==========================================
    // ACTIVITY LOG - ROLE CHANGE
    // ==========================================

    if (roleChanged) {
      await createActivityLog(
        req,
        "User Management",
        `Changed role of user: ${cleanUsername} from ${oldUser.role} to ${role}.`
      );
    }

    // ==========================================
    // ACTIVITY LOG - STATUS CHANGE
    // ==========================================

    if (statusChanged) {
      const statusActivity =
        finalStatus === "active"
          ? `Activated user: ${cleanUsername}.`
          : `Deactivated user: ${cleanUsername}.`;

      await createActivityLog(
        req,
        "User Management",
        statusActivity
      );
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    return res.json({
      success: true,
      message: "User updated successfully.",
    });
  } catch (error) {
    console.error("==========================================");
    console.error("UPDATE USER ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error("SQL MESSAGE:", error.sqlMessage);
    console.error("SQL STATE:", error.sqlState);
    console.error("==========================================");

    return res.status(500).json({
      success: false,
      message: "Failed to update user.",
    });
  }
};

// ==========================================
// DELETE USER
// ==========================================

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // PREVENT DELETING OWN ACCOUNT
    // ==========================================

    if (Number(req.user.id) === Number(id)) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own account.",
      });
    }

    // ==========================================
    // CHECK USER EXISTS
    // ==========================================

    const [existingUser] = await db.query(
      `
      SELECT
        id,
        full_name,
        username,
        email,
        role,
        status
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = existingUser[0];

    // ==========================================
    // DELETE
    // ==========================================

    await db.query(
      `
      DELETE FROM users
      WHERE id = ?
      `,
      [id]
    );

    // ==========================================
    // ACTIVITY LOG
    // ==========================================

    await createActivityLog(
      req,
      "User Management",
      `Deleted user: ${user.username}.`
    );

    // ==========================================
    // SUCCESS
    // ==========================================

    return res.json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("==========================================");
    console.error("DELETE USER ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error("SQL MESSAGE:", error.sqlMessage);
    console.error("SQL STATE:", error.sqlState);
    console.error("==========================================");

    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
};

// ==========================================
// TOGGLE USER STATUS
// ==========================================

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // PREVENT DEACTIVATING OWN ACCOUNT
    // ==========================================

    if (Number(req.user.id) === Number(id)) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot deactivate your own account.",
      });
    }

    // ==========================================
    // GET CURRENT USER
    // ==========================================

    const [rows] = await db.query(
      `
      SELECT
        id,
        username,
        status
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = rows[0];

    // ==========================================
    // NEW STATUS
    // ==========================================

    const newStatus =
      user.status === "active"
        ? "inactive"
        : "active";

    // ==========================================
    // UPDATE STATUS
    // ==========================================

    await db.query(
      `
      UPDATE users
      SET status = ?
      WHERE id = ?
      `,
      [newStatus, id]
    );

    // ==========================================
    // ACTIVITY LOG
    // ==========================================

    const activity =
      newStatus === "active"
        ? `Activated user: ${user.username}.`
        : `Deactivated user: ${user.username}.`;

    await createActivityLog(
      req,
      "User Management",
      activity
    );

    // ==========================================
    // SUCCESS
    // ==========================================

    return res.json({
      success: true,
      message: `User ${
        newStatus === "active"
          ? "activated"
          : "deactivated"
      } successfully.`,
      status: newStatus,
    });
  } catch (error) {
    console.error("==========================================");
    console.error("TOGGLE USER STATUS ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error("SQL MESSAGE:", error.sqlMessage);
    console.error("SQL STATE:", error.sqlState);
    console.error("==========================================");

    return res.status(500).json({
      success: false,
      message: "Failed to update user status.",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getUsers,
  addUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
};