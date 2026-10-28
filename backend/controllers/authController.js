const db = require("../config/db");
const { hashPassword, verifyPassword } = require("../utils/passwordHash");
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

    const check = await verifyPassword(password, user.password);

    if (!check.valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    // Upgrade an older hash to Argon2id now that we know the password.
    if (check.needsRehash) {
      try {
        const upgraded = await hashPassword(password);

        await db.query("UPDATE users SET password = ? WHERE id = ?", [
          upgraded,
          user.id,
        ]);
      } catch (error) {
        console.error("PASSWORD UPGRADE ERROR:", error.message);
      }
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

    const passwordMatch = (
      await verifyPassword(
        currentPassword,
        user.password
      )
    ).valid;

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
      await hashPassword(newPassword);

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

// ==========================================================
// FORGOT PASSWORD (6-digit code sent to the registered email)
// ==========================================================
// 1. forgotPassword: the user enters their username and registered email.
//    If both belong to the same active account, a random 6-digit code is
//    sent to that email (valid for 10 minutes).
// 2. resetPassword: the user enters the code and a new password.
// Works the same for the Department Head and PESO Staff; nobody has to
// approve it. The response never says whether the email exists.
// ==========================================================

const crypto = require("crypto");
const { isMailConfigured, sendMail } = require("../config/mailer");

const CODE_MINUTES = 10;
const MAX_CODE_ATTEMPTS = 5;

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const hashCode = (userId, code) =>
  crypto.createHash("sha256").update(`${userId}:${code}`).digest("hex");

// Small in-memory limit so the form cannot be used to flood an inbox.
const resetAttempts = new Map();
const tooManyRequests = (key) => {
  const now = Date.now();
  const recent = (resetAttempts.get(key) || []).filter(
    (t) => now - t < 15 * 60 * 1000
  );
  recent.push(now);
  resetAttempts.set(key, recent);
  return recent.length > 5;
};

// The username and the registered email must belong to the same active
// account. This is how the system knows which account (Department Head or
// PESO Staff) is being reset, even if two accounts share an email address.
const findActiveUser = async (username, email) => {
  const [users] = await db.query(
    `
    SELECT id, username, full_name, email, status
    FROM users
    WHERE username = ?
    LIMIT 1
    `,
    [username]
  );

  const user = users && users[0];

  if (
    !user ||
    String(user.email || "").trim().toLowerCase() !== email ||
    (user.status && String(user.status).toLowerCase() !== "active")
  ) {
    return [];
  }

  return [user];
};

// Forgot password: 3 requests, then a 2-minute wait (counted per computer + username).
const FORGOT_MAX_REQUESTS = 3;
const FORGOT_LOCK_SECONDS = 120;
const forgotState = new Map();

const getForgotState = (key) => {
  const now = Date.now();
  let st = forgotState.get(key) || { count: 0, lockedUntil: 0, updated: now };

  // The wait is over, or the person stopped trying for a while: start fresh.
  if (
    (st.lockedUntil && now >= st.lockedUntil) ||
    now - st.updated > 10 * 60 * 1000
  ) {
    st = { count: 0, lockedUntil: 0, updated: now };
  }

  forgotState.set(key, st);
  return st;
};

// Returns the seconds the person must now wait (0 = no wait yet).
const countForgotRequest = (key, st) => {
  st.count += 1;
  st.updated = Date.now();
  if (st.count >= FORGOT_MAX_REQUESTS) {
    st.lockedUntil = Date.now() + FORGOT_LOCK_SECONDS * 1000;
  }
  forgotState.set(key, st);
  return st.lockedUntil ? FORGOT_LOCK_SECONDS : 0;
};

const formatWait = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

// Forget idle entries so the map does not grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, st] of forgotState) {
    if (now - st.updated > 15 * 60 * 1000) forgotState.delete(key);
  }
}, 10 * 60 * 1000).unref();

exports.forgotPassword = async (req, res) => {
  try {
    const username = String(req.body?.username || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!username || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter your username and the registered email address.",
      });
    }

    // ---- 3 requests, then wait 2 minutes ----
    const limitKey = `${getIpAddress(req)}|${username.toLowerCase()}`;
    const state = getForgotState(limitKey);

    if (state.lockedUntil > Date.now()) {
      const wait = Math.ceil((state.lockedUntil - Date.now()) / 1000);

      return res.status(429).json({
        success: false,
        message: `Too many requests. Please wait ${formatWait(wait)} before trying again.`,
        retryAfter: wait,
      });
    }

    const retryAfter = countForgotRequest(limitKey, state);
    const attemptsLeft = Math.max(0, FORGOT_MAX_REQUESTS - state.count);

    const mailReady = isMailConfigured();
    const isProduction = process.env.NODE_ENV === "production";

    if (!mailReady && isProduction) {
      console.error(
        "FORGOT PASSWORD: no email service is set up. See DEPLOYMENT.md (Brevo) or add SMTP_* to backend/.env."
      );

      return res.status(503).json({
        success: false,
        message:
          "The email service is not available right now. Please try again later.",
        retryAfter,
      });
    }

    // ---- the username and the registered email must match ----
    const [found] = await db.query(
      `
      SELECT id, username, full_name, email, status
      FROM users
      WHERE username = ?
      LIMIT 1
      `,
      [username]
    );

    const account = found && found[0];

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Username not found.",
        retryAfter,
        attemptsLeft,
      });
    }

    if (account.status && String(account.status).toLowerCase() !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "This account is inactive. Please contact the Department Head.",
        retryAfter,
        attemptsLeft,
      });
    }

    if (!String(account.email || "").trim()) {
      return res.status(400).json({
        success: false,
        message:
          "This account has no registered email. Please contact the Department Head to add one.",
        retryAfter,
        attemptsLeft,
      });
    }

    if (String(account.email).trim().toLowerCase() !== email) {
      return res.status(400).json({
        success: false,
        message:
          "The email does not match this username. Please use your registered email.",
        retryAfter,
        attemptsLeft,
      });
    }

    const active = [account];

    if (active.length > 0) {
      const codes = [];

      for (const user of active) {
        const code = String(crypto.randomInt(100000, 1000000));

        await db.query(
          "DELETE FROM password_resets WHERE user_id = ? AND used_at IS NULL",
          [user.id]
        );

        await db.query(
          `
          INSERT INTO password_resets (user_id, token_hash, expires_at, attempts)
          VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE), 0)
          `,
          [user.id, hashCode(user.id, code), CODE_MINUTES]
        );

        codes.push({
          username: user.username,
          name: user.full_name || user.username,
          code,
        });

        await createActivityLog({
          userId: user.id,
          username: user.username,
          module: "Password Reset",
          activity: `Password reset code sent to ${user.username}.`,
          ipAddress: getIpAddress(req),
        });
      }

      if (!mailReady) {
        // Development only: no email server is set up, so show the code in
        // the backend terminal instead of sending it.
        codes.forEach((c) =>
          console.log(
            `\n[DEV] Password reset code for "${c.username}": ${c.code}  (valid ${CODE_MINUTES} minutes)\n` +
              "Email is not set up (SMTP_HOST / SMTP_USER / SMTP_PASS in backend/.env), so it was not emailed.\n"
          )
        );

        return res.status(200).json({
          success: true,
          message:
            "Email is not set up on this server (development mode). The code is shown in the backend terminal.",
          retryAfter,
          attemptsLeft,
        });
      }

      const many = codes.length > 1;

      const text = [
        `Hello ${codes[0].name},`,
        "",
        "Use this code to reset your REFERGO password:",
        "",
        ...codes.map((c) => (many ? `${c.username}: ${c.code}` : c.code)),
        "",
        `The code expires in ${CODE_MINUTES} minutes and works once.`,
        "If you did not ask for this, ignore this email. Your password will not change.",
        "",
        "REFERGO - Public Employment Service Office, Mendez, Cavite",
      ].join("\n");

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#1b1f3a">
          <div style="background:#202860;color:#fff;padding:16px 20px;border-bottom:4px solid #e01838">
            <strong style="font-size:16px">REFERGO</strong><br>
            <span style="font-size:12px">Public Employment Service Office, Mendez, Cavite</span>
          </div>
          <div style="padding:20px;border:1px solid #d2d6dc;border-top:0">
            <p>Hello ${esc(codes[0].name)},</p>
            <p>Use this code to reset your REFERGO password:</p>
            ${codes
              .map(
                (c) => `
              <p style="margin:14px 0;text-align:center">
                ${many ? `<span style="font-size:13px">Account: <strong>${esc(c.username)}</strong></span><br>` : ""}
                <span style="display:inline-block;font-size:30px;letter-spacing:8px;font-weight:bold;color:#202860;background:#f4f5fa;border:1px solid #d2d6dc;padding:10px 18px;margin-top:6px">${c.code}</span>
              </p>`
              )
              .join("")}
            <p style="font-size:13px;color:#4d5372">The code expires in ${CODE_MINUTES} minutes and works once. If you did not ask for this, ignore this email and your password will not change.</p>
          </div>
        </div>`;

      try {
        await sendMail({
          to: email,
          subject: "Your REFERGO password reset code",
          text,
          html,
        });
      } catch (mailError) {
        console.error("FORGOT PASSWORD EMAIL ERROR:", mailError.message);

        return res.status(502).json({
          success: false,
          message:
            "The code could not be sent. Please try again in a few minutes.",
          retryAfter,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "A 6-digit code was sent to your registered email.",
      retryAfter,
      attemptsLeft,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while sending the code.",
    });
  }
};

exports.resetPassword = async (req, res) => {
  const invalid = {
    success: false,
    message:
      "The code is incorrect or has expired. Please check it or request a new code.",
  };

  try {
    const username = String(req.body?.username || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const code = String(req.body?.code || "").trim();
    const password = String(req.body?.password || "");

    if (!username || !email || !/^\d{6}$/.test(code)) {
      return res.status(400).json(invalid);
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    if (tooManyRequests(`reset|${getIpAddress(req)}|${username.toLowerCase()}`)) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please try again in a few minutes.",
      });
    }

    const active = await findActiveUser(username, email);

    if (active.length === 0) {
      return res.status(400).json(invalid);
    }

    const ids = active.map((u) => u.id);

    const [rows] = await db.query(
      `
      SELECT id, user_id, token_hash, attempts
      FROM password_resets
      WHERE user_id IN (${ids.map(() => "?").join(",")})
        AND used_at IS NULL
        AND expires_at > NOW()
      `,
      ids
    );

    const usable = (rows || []).filter(
      (r) => Number(r.attempts) < MAX_CODE_ATTEMPTS
    );

    const match = usable.find(
      (r) => r.token_hash === hashCode(r.user_id, code)
    );

    if (!match) {
      if (usable.length > 0) {
        await db.query(
          `UPDATE password_resets SET attempts = attempts + 1 WHERE id IN (${usable
            .map(() => "?")
            .join(",")})`,
          usable.map((r) => r.id)
        );
      }

      return res.status(400).json(invalid);
    }

    const hashed = await hashPassword(password);

    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      match.user_id,
    ]);

    await db.query(
      "UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL",
      [match.user_id]
    );

    const user = active.find((u) => u.id === match.user_id);

    await createActivityLog({
      userId: match.user_id,
      username: user?.username || null,
      module: "Password Reset",
      activity: "Password was reset using an emailed code.",
      ipAddress: getIpAddress(req),
    });

    return res.status(200).json({
      success: true,
      message: "Your password has been changed. You can now sign in.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while resetting the password.",
    });
  }
};
