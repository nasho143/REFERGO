// Loads a .sql file (your exported database) into the configured database.
//   npm run db:import                    -> ../database/refergo.sql
//   npm run db:import -- path/to/file.sql
//
// On Railway:  railway run npm run db:import   (uses the Railway MySQL settings)

const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { buildDbConfig } = require("../config/dbConfig");

async function main() {
  const file = path.resolve(
    process.argv[2] || path.join(__dirname, "..", "..", "database", "refergo.sql")
  );

  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(file, "utf8");

  if (!sql.trim()) {
    console.error(`${file} is empty. Export your database first (see DEPLOYMENT.md).`);
    process.exit(1);
  }

  const config = buildDbConfig();
  console.log(`Importing ${path.basename(file)} into ${config.database} on ${config.host}:${config.port} ...`);

  const connection = await mysql.createConnection({
    ...config,
    multipleStatements: true,
  });

  try {
    await connection.query(sql);
    console.log("Done.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Import failed:", error.message);
  process.exit(1);
});
