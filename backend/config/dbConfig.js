require("dotenv").config();

// ==========================================
// DATABASE SETTINGS
// Works locally (DB_HOST, DB_USER, ...), on Railway (MYSQLHOST, ... or
// MYSQL_URL), and with any single connection URL (DATABASE_URL).
// ==========================================

const TIMEZONE = process.env.DB_TIMEZONE || "+08:00"; // Philippines

function buildDbConfig() {
  const env = process.env;
  const url = env.MYSQL_URL || env.DATABASE_URL;

  let base;

  if (url) {
    const u = new URL(url);

    base = {
      host: u.hostname,
      port: Number(u.port) || 3306,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace(/^\//, ""),
    };
  } else {
    base = {
      host: env.DB_HOST || env.MYSQLHOST,
      port: Number(env.DB_PORT || env.MYSQLPORT) || 3306,
      user: env.DB_USER || env.MYSQLUSER,
      password:
        env.DB_PASSWORD !== undefined ? env.DB_PASSWORD : env.MYSQLPASSWORD,
      database: env.DB_NAME || env.MYSQLDATABASE || "refergo_deploy",
    };
  }

  // Some hosted databases require SSL: set DB_SSL=true.
  if (env.DB_SSL === "true") {
    base.ssl = { rejectUnauthorized: false };
  }

  // Dates are read and written in Philippine time wherever the server runs.
  base.timezone = TIMEZONE;

  return base;
}

module.exports = { buildDbConfig, TIMEZONE };
