const mysql = require("mysql2/promise");
require("dotenv").config();

// ==========================================
// MYSQL DATABASE CONNECTION
// ==========================================

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
// TEST DATABASE CONNECTION
// ==========================================

(async () => {
  try {
    const connection = await db.getConnection();

    console.log("CONFIG FILE LOADED");
    console.log("✅ Connected to MySQL Database");

    connection.release();
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