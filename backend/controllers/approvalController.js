const db = require("../config/db");

// ==========================================================
// ACTIVITY LOG
// ==========================================================

const getIpAddress = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (forwardedFor) {
    return String(forwardedFor).split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || null;
};

const createActivityLog = async ({
  userId,
  username,
  module,
  activity,
  ipAddress,
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
      [userId, username, module, activity, ipAddress]
    );
  } catch (error) {
    console.error("CREATE APPROVAL ACTIVITY LOG ERROR:", error);
  }
};

const getReviewer = (req) => ({
  userId: req.user?.id || null,
  username: req.user?.username || "Unknown User",
});

// ==========================================================
// GENERIC APPROVAL VALIDATION
// ==========================================================
// Approval/rejection is controlled by the Department Head routes.
// A record must be Pending before it can be approved or rejected.
//
// IMPORTANT: submitted_by is audit information only. Legacy records
// may have submitted_by = NULL, so it must not block a valid review.
// ==========================================================

const validatePendingRecord = async ({
  table,
  idColumn,
  id,
  fields,
  notFoundMessage,
}) => {
  const columns = [idColumn, ...fields].join(", ");

  const [rows] = await db.query(
    `
    SELECT ${columns}
    FROM ${table}
    WHERE ${idColumn} = ?
    LIMIT 1
    `,
    [id]
  );

  if (!rows || rows.length === 0) {
    return {
      error: {
        status: 404,
        message: notFoundMessage,
      },
    };
  }

  const record = rows[0];

  if (String(record.approval_status || "").trim().toLowerCase() !== "pending") {
    return {
      error: {
        status: 400,
        message:
          `This record cannot be reviewed because its current ` +
          `approval status is "${record.approval_status}".`,
      },
    };
  }

  return { record };
};

// ==========================================================
// APPROVE HELPER
// ==========================================================

const approveRecord = async ({
  req,
  res,
  table,
  idColumn,
  id,
  module,
  displayName,
  notFoundMessage,
}) => {
  try {
    const reviewer = getReviewer(req);

    const result = await validatePendingRecord({
      table,
      idColumn,
      id,
      fields: ["approval_status", "submitted_by"],
      notFoundMessage,
    });

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      });
    }

    const record = result.record;

    const updateResult = await db.query(
      `
      UPDATE ${table}
      SET
        approval_status = 'Approved',
        reviewed_by = ?,
        reviewed_at = CURRENT_TIMESTAMP,
        rejection_reason = NULL
      WHERE ${idColumn} = ?
        AND LOWER(TRIM(COALESCE(approval_status, ''))) = 'pending'
      `,
      [reviewer.userId, id]
    );

    if (updateResult[0].affectedRows === 0) {
      return res.status(409).json({
        success: false,
        message: "The record is no longer pending and cannot be reviewed.",
      });
    }

    await createActivityLog({
      userId: reviewer.userId,
      username: reviewer.username,
      module,
      activity:
        `Department Head ${reviewer.username} approved ${displayName(record)}.`,
      ipAddress: getIpAddress(req),
    });

    return res.status(200).json({
      success: true,
      message: `${displayName(record)} approved successfully.`,
    });
  } catch (error) {
    console.error(`APPROVE ${module.toUpperCase()} ERROR:`, error);

    return res.status(500).json({
      success: false,
      message: `Failed to approve ${module.toLowerCase()} record.`,
    });
  }
};

// ==========================================================
// REJECT HELPER
// ==========================================================

const rejectRecord = async ({
  req,
  res,
  table,
  idColumn,
  id,
  module,
  displayName,
  notFoundMessage,
}) => {
  try {
    const { rejection_reason } = req.body;

    if (!rejection_reason || !String(rejection_reason).trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required.",
      });
    }

    const reviewer = getReviewer(req);

    const result = await validatePendingRecord({
      table,
      idColumn,
      id,
      fields: ["approval_status", "submitted_by"],
      notFoundMessage,
    });

    if (result.error) {
      return res.status(result.error.status).json({
        success: false,
        message: result.error.message,
      });
    }

    const record = result.record;
    const reason = String(rejection_reason).trim();

    const updateResult = await db.query(
      `
      UPDATE ${table}
      SET
        approval_status = 'Rejected',
        reviewed_by = ?,
        reviewed_at = CURRENT_TIMESTAMP,
        rejection_reason = ?
      WHERE ${idColumn} = ?
        AND LOWER(TRIM(COALESCE(approval_status, ''))) = 'pending'
      `,
      [reviewer.userId, reason, id]
    );

    if (updateResult[0].affectedRows === 0) {
      return res.status(409).json({
        success: false,
        message: "The record is no longer pending and cannot be reviewed.",
      });
    }

    await createActivityLog({
      userId: reviewer.userId,
      username: reviewer.username,
      module,
      activity:
        `Department Head ${reviewer.username} rejected ${displayName(record)}. ` +
        `Reason: ${reason}`,
      ipAddress: getIpAddress(req),
    });

    return res.status(200).json({
      success: true,
      message: `${displayName(record)} rejected successfully.`,
    });
  } catch (error) {
    console.error(`REJECT ${module.toUpperCase()} ERROR:`, error);

    return res.status(500).json({
      success: false,
      message: `Failed to reject ${module.toLowerCase()} record.`,
    });
  }
};

// ==========================================================
// APPLICANTS
// ==========================================================

exports.approveApplicant = (req, res) =>
  approveRecord({
    req,
    res,
    table: "applicants",
    idColumn: "applicant_id",
    id: req.params.id,
    module: "Applicants",
    displayName: (r) => `applicant ${r.full_name}`,
    notFoundMessage: "Applicant not found.",
  });

exports.rejectApplicant = (req, res) =>
  rejectRecord({
    req,
    res,
    table: "applicants",
    idColumn: "applicant_id",
    id: req.params.id,
    module: "Applicants",
    displayName: (r) => `applicant ${r.full_name}`,
    notFoundMessage: "Applicant not found.",
  });

// ==========================================================
// EMPLOYERS
// ==========================================================

exports.approveEmployer = (req, res) =>
  approveRecord({
    req,
    res,
    table: "employers",
    idColumn: "employer_id",
    id: req.params.id,
    module: "Employers",
    displayName: (r) => `employer ${r.company_name}`,
    notFoundMessage: "Employer not found.",
  });

exports.rejectEmployer = (req, res) =>
  rejectRecord({
    req,
    res,
    table: "employers",
    idColumn: "employer_id",
    id: req.params.id,
    module: "Employers",
    displayName: (r) => `employer ${r.company_name}`,
    notFoundMessage: "Employer not found.",
  });

// ==========================================================
// JOB VACANCIES
// ==========================================================

exports.approveVacancy = (req, res) =>
  approveRecord({
    req,
    res,
    table: "job_vacancies",
    idColumn: "vacancy_id",
    id: req.params.id,
    module: "Job Vacancies",
    displayName: (r) => `job vacancy ${r.position_title}`,
    notFoundMessage: "Job vacancy not found.",
  });

exports.rejectVacancy = (req, res) =>
  rejectRecord({
    req,
    res,
    table: "job_vacancies",
    idColumn: "vacancy_id",
    id: req.params.id,
    module: "Job Vacancies",
    displayName: (r) => `job vacancy ${r.position_title}`,
    notFoundMessage: "Job vacancy not found.",
  });

// ==========================================================
// REFERRALS
// ==========================================================

exports.approveReferral = (req, res) =>
  approveRecord({
    req,
    res,
    table: "referrals",
    idColumn: "referral_id",
    id: req.params.id,
    module: "Referrals",
    displayName: (r) => `referral #${r.referral_id}`,
    notFoundMessage: "Referral not found.",
  });

exports.rejectReferral = (req, res) =>
  rejectRecord({
    req,
    res,
    table: "referrals",
    idColumn: "referral_id",
    id: req.params.id,
    module: "Referrals",
    displayName: (r) => `referral #${r.referral_id}`,
    notFoundMessage: "Referral not found.",
  });
