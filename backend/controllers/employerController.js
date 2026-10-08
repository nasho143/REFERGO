const db = require("../config/db");

// ============================================================
// APPROVAL WORKFLOW HELPER
// ============================================================

function getApprovalData(req) {
  const userId = req.user?.id || null;
  const role = String(req.user?.role || "").trim().toLowerCase();

  // PESO Staff submissions require Department Head review.
  // Department Head CRUD is immediately approved.
  if (role === "department_head") {
    return {
      approvalStatus: "Approved",
      submittedBy: userId,
      reviewedBy: userId,
      reviewedAt: "CURRENT_TIMESTAMP",
    };
  }

  return {
    approvalStatus: "Pending",
    submittedBy: userId,
    reviewedBy: null,
    reviewedAt: null,
  };
}


// ======================================
// ACTIVITY LOG HELPER
// ======================================

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
        "EMPLOYER ACTIVITY LOG ERROR:",
        error
      );

      // Activity logging should never
      // prevent the main Employer operation
      // from succeeding.
    });
}

// ======================================
// GET ALL EMPLOYERS
// ======================================

exports.getEmployers = (req, res) => {
  const sql = `
    SELECT
      employer_id,
      company_name,
      address,
      contact_person,
      contact_number,
      email,
      reapply_cooldown_days,
      approval_status,
      submitted_by,
      reviewed_by,
      reviewed_at,
      rejection_reason,
      created_at
    FROM employers
    ORDER BY employer_id DESC
  `;

  db.query(
    sql,
    (err, results) => {
      if (err) {
        console.error(
          "GET EMPLOYERS ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to retrieve employers.",
        });
      }

      res.json(results);
    }
  );
};

// ======================================
// GET SINGLE EMPLOYER
// ======================================

exports.getEmployer = (
  req,
  res
) => {
  const { employer_id } =
    req.params;

  const sql = `
    SELECT
      employer_id,
      company_name,
      address,
      contact_person,
      contact_number,
      email,
      reapply_cooldown_days,
      approval_status,
      submitted_by,
      reviewed_by,
      reviewed_at,
      rejection_reason,
      created_at
    FROM employers
    WHERE employer_id = ?
  `;

  db.query(
    sql,
    [employer_id],
    (err, results) => {
      if (err) {
        console.error(
          "GET EMPLOYER ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to retrieve employer.",
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Employer not found.",
        });
      }

      res.json(results[0]);
    }
  );
};

// ======================================
// ADD EMPLOYER
// ======================================

exports.addEmployer = (
  req,
  res
) => {
  const {
    company_name,
    address,
    contact_person,
    contact_number,
    email,
    reapply_cooldown_days,
  } = req.body;

  if (
    !company_name ||
    !company_name.trim()
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Company name is required.",
    });
  }

  // Default to 90 days if no value is provided
  const cooldownDays =
    reapply_cooldown_days !==
      undefined &&
    reapply_cooldown_days !==
      null &&
    reapply_cooldown_days !== ""
      ? Number(
          reapply_cooldown_days
        )
      : 90;

  // Validate cooldown days
  if (
    !Number.isInteger(
      cooldownDays
    ) ||
    cooldownDays < 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Reapplication cooldown must be a valid number of days.",
    });
  }

  const cleanCompanyName =
    company_name.trim();

  const sql = `
    INSERT INTO employers
    (
      company_name,
      address,
      contact_person,
      contact_number,
      email,
      reapply_cooldown_days,
      approval_status,
      submitted_by,
      reviewed_by,
      reviewed_at,
      rejection_reason
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      cleanCompanyName,
      address
        ? address.trim()
        : "",
      contact_person
        ? contact_person.trim()
        : "",
      contact_number
        ? contact_number.trim()
        : "",
      email
        ? email.trim()
        : "",
      cooldownDays,
      getApprovalData(req).approvalStatus,
      getApprovalData(req).submittedBy,
      getApprovalData(req).reviewedBy,
      null,
      null,
    ],
    async (err, result) => {
      if (err) {
        console.error(
          "ADD EMPLOYER ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to add employer.",
        });
      }

      // ======================================
      // ACTIVITY LOG
      // ======================================

      await createActivityLog(
        req,
        "Employers",
        `Added employer: ${cleanCompanyName}.`
      );

      res.status(201).json({
        success: true,
        message:
          "Employer added successfully.",
        employer_id:
          result.insertId,
        reapply_cooldown_days:
          cooldownDays,
      });
    }
  );
};

// ======================================
// UPDATE EMPLOYER
// ======================================

exports.updateEmployer = (
  req,
  res
) => {
  const { employer_id } =
    req.params;

  const {
    company_name,
    address,
    contact_person,
    contact_number,
    email,
    reapply_cooldown_days,
  } = req.body;

  if (
    !company_name ||
    !company_name.trim()
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Company name is required.",
    });
  }

  // Default to 90 days if no value is provided
  const cooldownDays =
    reapply_cooldown_days !==
      undefined &&
    reapply_cooldown_days !==
      null &&
    reapply_cooldown_days !== ""
      ? Number(
          reapply_cooldown_days
        )
      : 90;

  // Validate cooldown days
  if (
    !Number.isInteger(
      cooldownDays
    ) ||
    cooldownDays < 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Reapplication cooldown must be a valid number of days.",
    });
  }

  const cleanCompanyName =
    company_name.trim();

  const sql = `
    UPDATE employers
    SET
      company_name = ?,
      address = ?,
      contact_person = ?,
      contact_number = ?,
      email = ?,
      reapply_cooldown_days = ?,
      approval_status = ?,
      submitted_by = ?,
      reviewed_by = ?,
      reviewed_at = ?,
      rejection_reason = ?
    WHERE employer_id = ?
  `;

  db.query(
    sql,
    [
      cleanCompanyName,
      address
        ? address.trim()
        : "",
      contact_person
        ? contact_person.trim()
        : "",
      contact_number
        ? contact_number.trim()
        : "",
      email
        ? email.trim()
        : "",
      cooldownDays,
      getApprovalData(req).approvalStatus,
      getApprovalData(req).submittedBy,
      getApprovalData(req).reviewedBy,
      null,
      null,
      employer_id,
    ],
    async (err, result) => {
      if (err) {
        console.error(
          "UPDATE EMPLOYER ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to update employer.",
        });
      }

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Employer not found.",
        });
      }

      // ======================================
      // ACTIVITY LOG
      // ======================================

      await createActivityLog(
        req,
        "Employers",
        `Updated employer: ${cleanCompanyName}.`
      );

      res.json({
        success: true,
        message:
          "Employer updated successfully.",
        reapply_cooldown_days:
          cooldownDays,
      });
    }
  );
};

// ======================================
// DELETE EMPLOYER
// ======================================

exports.deleteEmployer = (
  req,
  res
) => {
  const { employer_id } =
    req.params;

  // First get the company name so the
  // activity log can identify the employer.

  const findSql = `
    SELECT
      employer_id,
      company_name
    FROM employers
    WHERE employer_id = ?
    LIMIT 1
  `;

  db.query(
    findSql,
    [employer_id],
    (findErr, findResults) => {
      if (findErr) {
        console.error(
          "FIND EMPLOYER BEFORE DELETE ERROR:",
          findErr
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to find employer.",
        });
      }

      if (
        findResults.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Employer not found.",
        });
      }

      const employer =
        findResults[0];

      const sql = `
        DELETE FROM employers
        WHERE employer_id = ?
      `;

      db.query(
        sql,
        [employer_id],
        async (err, result) => {
          if (err) {
            console.error(
              "DELETE EMPLOYER ERROR:",
              err
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to delete employer.",
            });
          }

          if (
            result.affectedRows === 0
          ) {
            return res.status(404).json({
              success: false,
              message:
                "Employer not found.",
            });
          }

          // ======================================
          // ACTIVITY LOG
          // ======================================

          await createActivityLog(
            req,
            "Employers",
            `Deleted employer: ${employer.company_name}.`
          );

          res.json({
            success: true,
            message:
              "Employer deleted successfully.",
          });
        }
      );
    }
  );
};