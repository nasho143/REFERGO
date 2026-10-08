const db = require("../config/db");

// ======================================
// GET ACTIVITY LOGS
// ======================================
exports.getActivityLogs = (req, res) => {
  const sql = `
    SELECT
      log_id,
      user_id,
      username,
      module,
      activity,
      ip_address,
      created_at
    FROM activity_logs
    ORDER BY created_at DESC, log_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("GET ACTIVITY LOGS ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve activity logs.",
      });
    }

    return res.json({
      success: true,
      data: results,
    });
  });
};

// ======================================
// ADD ACTIVITY LOG
// ======================================
exports.createActivityLog = (req, res) => {
  const {
    user_id,
    username,
    module,
    activity,
    ip_address,
  } = req.body;

  if (!module || !activity) {
    return res.status(400).json({
      success: false,
      message: "Module and activity are required.",
    });
  }

  const sql = `
    INSERT INTO activity_logs
    (
      user_id,
      username,
      module,
      activity,
      ip_address
    )
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      user_id || null,
      username || null,
      module,
      activity,
      ip_address || null,
    ],
    (err, result) => {
      if (err) {
        console.error("CREATE ACTIVITY LOG ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to create activity log.",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Activity log created successfully.",
        log_id: result.insertId,
      });
    }
  );
};