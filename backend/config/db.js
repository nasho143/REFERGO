const mysql = require("mysql2/promise");
require("dotenv").config();
const { buildDbConfig, TIMEZONE } = require("./dbConfig");

// ==========================================
// MYSQL DATABASE CONNECTION
// ==========================================

const db = mysql.createPool({
  ...buildDbConfig(),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// MySQL functions such as NOW() and CURDATE() use Philippine time too, so
// "today", follow-ups and deadlines are the same on any host (Railway runs in UTC).
db.pool.on("connection", (connection) => {
  connection.query("SET time_zone = ?", [TIMEZONE]);
});

// ==========================================
// CALLBACK + PROMISE COMPATIBLE QUERY
// ==========================================

const originalQuery = db.query.bind(db);

db.query = function (sql, params, callback) {
  // db.query(sql, callback)
  if (typeof params === "function") {
    callback = params;
    params = [];
  }

  // Promise style:
  // await db.query(sql, params)
  if (typeof callback !== "function") {
    return originalQuery(sql, params);
  }

  // Callback style:
  // db.query(sql, params, callback)
  originalQuery(sql, params)
    .then(([rows, fields]) => {
      callback(null, rows, fields);
    })
    .catch((error) => {
      callback(error);
    });
};

// ==========================================
// SCHEMA UPDATE: applicant gender + birthdate
// Adds the two columns if the database does not have them yet,
// so the Applicants and Reports pages work without a manual migration.
// ==========================================

async function ensureApplicantColumns() {
  try {
    const [rows] = await originalQuery(
      `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'applicants'
        AND COLUMN_NAME IN ('gender', 'birthdate')
      `
    );

    const existing = rows.map((row) => row.COLUMN_NAME);

    if (!existing.includes("gender")) {
      await originalQuery(
        "ALTER TABLE applicants ADD COLUMN gender ENUM('Male','Female') NULL AFTER contact_number"
      );
      console.log("✅ Added applicants.gender");
    }

    if (!existing.includes("birthdate")) {
      await originalQuery(
        "ALTER TABLE applicants ADD COLUMN birthdate DATE NULL AFTER gender"
      );
      console.log("✅ Added applicants.birthdate");
    }
  } catch (error) {
    console.error("SCHEMA UPDATE ERROR:", error.message);
  }
}

// ==========================================
// SCHEMA UPDATE: Argon2id hashes are about 100 characters; the old bcrypt
// hashes were 60. Make sure users.password is long enough.
// ==========================================

async function ensurePasswordColumnLength() {
  try {
    const [rows] = await originalQuery(
      `
      SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH AS len
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'password'
      `
    );

    const column = rows && rows[0];

    if (
      column &&
      ["varchar", "char"].includes(String(column.DATA_TYPE).toLowerCase()) &&
      Number(column.len) < 255
    ) {
      await originalQuery(
        "ALTER TABLE users MODIFY password VARCHAR(255) NOT NULL"
      );
      console.log("✅ users.password widened to VARCHAR(255)");
    }
  } catch (error) {
    console.error("PASSWORD COLUMN ERROR:", error.message);
  }
}

// ==========================================
// SCHEMA UPDATE: password reset links
// ==========================================

async function ensurePasswordResetTable() {
  try {
    await originalQuery(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash CHAR(64) NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        attempts INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_password_resets_token (token_hash),
        INDEX idx_password_resets_user (user_id)
      )
    `);

    // Table made by an earlier version: add the attempts column.
    const [cols] = await originalQuery(
      `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'password_resets'
        AND COLUMN_NAME = 'attempts'
      `
    );

    if (cols.length === 0) {
      await originalQuery(
        "ALTER TABLE password_resets ADD COLUMN attempts INT NOT NULL DEFAULT 0"
      );
    }
  } catch (error) {
    console.error("PASSWORD RESET TABLE ERROR:", error.message);
  }
}

// ==========================================
// TEST DATABASE CONNECTION
// ==========================================

(async () => {
  try {
    const connection = await db.getConnection();

    console.log("CONFIG FILE LOADED");
    console.log("✅ Connected to MySQL Database");

    connection.release();

    await ensureApplicantColumns();
    await ensurePasswordResetTable();
    await ensurePasswordColumnLength();
  } catch (error) {
    console.error("==========================================");
    console.error("❌ DATABASE CONNECTION ERROR");
    console.error("MESSAGE:", error.message);
    console.error("CODE:", error.code);
    console.error("==========================================");
  }
})();

// ==========================================
// EXPORT
// ==========================================

module.exports = db;