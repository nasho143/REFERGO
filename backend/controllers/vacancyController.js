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


// ============================================================
// ACTIVITY LOG HELPER
// ============================================================

function getIpAddress(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return String(forwardedFor)
      .split(",")[0]
      .trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
}

function createActivityLog(req, module, activity) {
  const userId = req.user?.id || null;
  const username = req.user?.username || null;
  const ipAddress = getIpAddress(req);

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
        "VACANCY ACTIVITY LOG ERROR:",
        error
      );

      // Activity logging should never
      // prevent the main vacancy operation
      // from succeeding.
    });
}

// ============================================================
// GET ALL VACANCIES
// ============================================================

exports.getVacancies = (req, res) => {
  const sql = `
    SELECT
      v.vacancy_id,
      v.employer_id,
      v.position_title,
      v.qualifications,
      v.requirements,
      v.salary,
      v.location,
      v.employment_type,
      v.deadline,
      v.openings,
      v.status,
      v.approval_status,
      v.submitted_by,
      v.reviewed_by,
      v.reviewed_at,
      v.rejection_reason,
      v.created_at,
      e.company_name
    FROM job_vacancies v
    LEFT JOIN employers e
      ON v.employer_id = e.employer_id
    ORDER BY v.vacancy_id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("GET VACANCIES ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve vacancies.",
        error: err.message,
      });
    }

    return res.json(results);
  });
};

// ============================================================
// GET SINGLE VACANCY
// ============================================================

exports.getVacancyById = (req, res) => {
  const { vacancy_id } = req.params;

  const sql = `
    SELECT
      v.vacancy_id,
      v.employer_id,
      v.position_title,
      v.qualifications,
      v.requirements,
      v.salary,
      v.location,
      v.employment_type,
      v.deadline,
      v.openings,
      v.status,
      v.approval_status,
      v.submitted_by,
      v.reviewed_by,
      v.reviewed_at,
      v.rejection_reason,
      v.created_at,
      e.company_name
    FROM job_vacancies v
    LEFT JOIN employers e
      ON v.employer_id = e.employer_id
    WHERE v.vacancy_id = ?
    LIMIT 1
  `;

  db.query(sql, [vacancy_id], (err, results) => {
    if (err) {
      console.error("GET VACANCY ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve vacancy.",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vacancy not found.",
      });
    }

    return res.json(results[0]);
  });
};

// ============================================================
// ADD VACANCY
// ============================================================

exports.addVacancy = (req, res) => {
  const {
    employer_id,
    position_title,
    qualifications,
    requirements,
    salary,
    location,
    employment_type,
    deadline,
    openings,
    status,
  } = req.body;

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!employer_id) {
    return res.status(400).json({
      success: false,
      message: "Employer is required.",
    });
  }

  if (!position_title || !position_title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Position title is required.",
    });
  }

  if (
    openings === undefined ||
    openings === null ||
    openings === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "Number of openings is required.",
    });
  }

  if (Number(openings) < 1) {
    return res.status(400).json({
      success: false,
      message: "Number of openings must be at least 1.",
    });
  }

  if (!deadline) {
    return res.status(400).json({
      success: false,
      message: "Application deadline is required.",
    });
  }

  const vacancyStatus =
    status === "Closed"
      ? "Closed"
      : "Active";

  const cleanPositionTitle =
    position_title.trim();

  // ----------------------------------------------------------
  // INSERT
  // ----------------------------------------------------------

  const sql = `
    INSERT INTO job_vacancies
    (
      employer_id,
      position_title,
      qualifications,
      requirements,
      salary,
      location,
      employment_type,
      deadline,
      openings,
      status,
      approval_status,
      submitted_by,
      reviewed_by,
      reviewed_at,
      rejection_reason
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      Number(employer_id),
      cleanPositionTitle,
      qualifications || "",
      requirements || "",
      salary || "",
      location || "",
      employment_type || "Full-time",
      deadline,
      Number(openings),
      vacancyStatus,
      getApprovalData(req).approvalStatus,
      getApprovalData(req).submittedBy,
      getApprovalData(req).reviewedBy,
      null,
      null,
    ],
    async (err, result) => {
      if (err) {
        console.error("ADD VACANCY ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to add vacancy.",
          error: err.message,
        });
      }

      // --------------------------------------------------------
      // ACTIVITY LOG
      // --------------------------------------------------------

      await createActivityLog(
        req,
        "Job Vacancies",
        `Added vacancy: ${cleanPositionTitle}.`
      );

      return res.status(201).json({
        success: true,
        message: "Vacancy added successfully.",
        vacancy_id: result.insertId,
      });
    }
  );
};

// ============================================================
// UPDATE VACANCY
// ============================================================

exports.updateVacancy = (req, res) => {
  const { vacancy_id } = req.params;

  const {
    employer_id,
    position_title,
    qualifications,
    requirements,
    salary,
    location,
    employment_type,
    deadline,
    openings,
    status,
  } = req.body;

  // ----------------------------------------------------------
  // VALIDATION
  // ----------------------------------------------------------

  if (!employer_id) {
    return res.status(400).json({
      success: false,
      message: "Employer is required.",
    });
  }

  if (!position_title || !position_title.trim()) {
    return res.status(400).json({
      success: false,
      message: "Position title is required.",
    });
  }

  if (
    openings === undefined ||
    openings === null ||
    openings === ""
  ) {
    return res.status(400).json({
      success: false,
      message: "Number of openings is required.",
    });
  }

  if (Number(openings) < 1) {
    return res.status(400).json({
      success: false,
      message: "Number of openings must be at least 1.",
    });
  }

  if (!deadline) {
    return res.status(400).json({
      success: false,
      message: "Application deadline is required.",
    });
  }

  const vacancyStatus =
    status === "Closed"
      ? "Closed"
      : "Active";

  const cleanPositionTitle =
    position_title.trim();

  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------

  const sql = `
    UPDATE job_vacancies
    SET
      employer_id = ?,
      position_title = ?,
      qualifications = ?,
      requirements = ?,
      salary = ?,
      location = ?,
      employment_type = ?,
      deadline = ?,
      openings = ?,
      status = ?,
      approval_status = ?,
      submitted_by = ?,
      reviewed_by = ?,
      reviewed_at = ?,
      rejection_reason = ?
    WHERE vacancy_id = ?
  `;

  db.query(
    sql,
    [
      Number(employer_id),
      cleanPositionTitle,
      qualifications || "",
      requirements || "",
      salary || "",
      location || "",
      employment_type || "Full-time",
      deadline,
      Number(openings),
      vacancyStatus,
      getApprovalData(req).approvalStatus,
      getApprovalData(req).submittedBy,
      getApprovalData(req).reviewedBy,
      null,
      null,
      vacancy_id,
    ],
    async (err, result) => {
      if (err) {
        console.error("UPDATE VACANCY ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Failed to update vacancy.",
          error: err.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Vacancy not found.",
        });
      }

      // --------------------------------------------------------
      // ACTIVITY LOG
      // --------------------------------------------------------

      await createActivityLog(
        req,
        "Job Vacancies",
        `Updated vacancy: ${cleanPositionTitle}.`
      );

      return res.json({
        success: true,
        message: "Vacancy updated successfully.",
      });
    }
  );
};

// ============================================================
// DELETE VACANCY
// ============================================================

exports.deleteVacancy = (req, res) => {
  const { vacancy_id } = req.params;

  // ----------------------------------------------------------
  // GET VACANCY FIRST
  // ----------------------------------------------------------

  const findSql = `
    SELECT
      vacancy_id,
      position_title
    FROM job_vacancies
    WHERE vacancy_id = ?
    LIMIT 1
  `;

  db.query(
    findSql,
    [vacancy_id],
    (findErr, findResults) => {
      if (findErr) {
        console.error(
          "FIND VACANCY BEFORE DELETE ERROR:",
          findErr
        );

        return res.status(500).json({
          success: false,
          message: "Failed to find vacancy.",
          error: findErr.message,
        });
      }

      if (findResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Vacancy not found.",
        });
      }

      const vacancy = findResults[0];

      // --------------------------------------------------------
      // DELETE
      // --------------------------------------------------------

      const sql = `
        DELETE FROM job_vacancies
        WHERE vacancy_id = ?
      `;

      db.query(
        sql,
        [vacancy_id],
        async (err, result) => {
          if (err) {
            console.error(
              "DELETE VACANCY ERROR:",
              err
            );

            return res.status(500).json({
              success: false,
              message: "Failed to delete vacancy.",
              error: err.message,
            });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "Vacancy not found.",
            });
          }

          // ------------------------------------------------------
          // ACTIVITY LOG
          // ------------------------------------------------------

          await createActivityLog(
            req,
            "Job Vacancies",
            `Deleted vacancy: ${vacancy.position_title}.`
          );

          return res.json({
            success: true,
            message: "Vacancy deleted successfully.",
          });
        }
      );
    }
  );
};