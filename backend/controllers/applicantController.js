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

  return db.query(
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
  ).catch((error) => {
    console.error(
      "APPLICANT ACTIVITY LOG ERROR:",
      error
    );

    // Activity logging must not prevent
    // the Applicant operation from succeeding.
  });
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function isValidDate(value) {
  if (!value) return false;

  const date = new Date(
    `${value}T00:00:00`
  );

  return !Number.isNaN(
    date.getTime()
  );
}

function formatDate(date) {
  if (!date) return null;

  if (typeof date === "string") {
    const match = date.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year =
    parsed.getFullYear();

  const month = String(
    parsed.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    parsed.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calculateReadiness(applicant) {
  const profileFields = [
    applicant.full_name,
    applicant.address,
    applicant.contact_number,
    applicant.classification,
    applicant.education,
    applicant.work_experience,
  ];

  const completedProfileFields =
    profileFields.filter(
      (field) =>
        field !== null &&
        field !== undefined &&
        String(field).trim() !== ""
    ).length;

  const profileCompletionScore =
    Math.round(
      (completedProfileFields /
        profileFields.length) *
        100
    );

  const resumeScore =
    Number(
      applicant.resume_uploaded
    ) === 1
      ? 100
      : 0;

  const validIdScore =
    Number(
      applicant.valid_id_uploaded
    ) === 1
      ? 100
      : 0;

  const diplomaTorScore =
    Number(
      applicant.diploma_tor_uploaded
    ) === 1
      ? 100
      : 0;

  const requirementsScore =
    Math.round(
      (resumeScore +
        validIdScore +
        diplomaTorScore) /
        3
    );

  const skillsScore =
    applicant.skills &&
    String(
      applicant.skills
    ).trim() !== ""
      ? 100
      : 0;

  const interviewReadinessScore =
    Math.round(
      (profileCompletionScore +
        requirementsScore +
        skillsScore) /
        3
    );

  const jobReadinessScore =
    Math.round(
      profileCompletionScore * 0.3 +
        resumeScore * 0.15 +
        requirementsScore * 0.25 +
        skillsScore * 0.15 +
        interviewReadinessScore *
          0.15
    );

  return {
    profileCompletionScore,
    resumeScore,
    requirementsScore,
    skillsScore,
    interviewReadinessScore,
    jobReadinessScore,
  };
}

// ============================================================
// GET ALL APPLICANTS
// ============================================================

exports.getApplicants = (req, res) => {
  const sql = `
    SELECT
      applicant_id,
      full_name,
      address,
      contact_number,
      classification,
      education,
      work_experience,
      skills,
      created_at,

      resume_uploaded,
      valid_id_uploaded,
      diploma_tor_uploaded,

      profile_completion_score,
      resume_score,
      requirements_score,
      skills_score,
      interview_readiness_score,
      job_readiness_score,

      peso_comment,

      approval_status,
      submitted_by,
      reviewed_by,
      reviewed_at,
      rejection_reason

    FROM applicants
    ORDER BY applicant_id DESC
  `;

  db.query(
    sql,
    (err, results) => {
      if (err) {
        console.error(
          "GET APPLICANTS ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to fetch applicants.",
          error: err.message,
        });
      }

      const applicants =
        results.map(
          (applicant) => {
            const readiness =
              calculateReadiness(
                applicant
              );

            return {
              ...applicant,

              resume_uploaded:
                Number(
                  applicant.resume_uploaded
                ) || 0,

              valid_id_uploaded:
                Number(
                  applicant.valid_id_uploaded
                ) || 0,

              diploma_tor_uploaded:
                Number(
                  applicant.diploma_tor_uploaded
                ) || 0,

              profile_completion_score:
                readiness.profileCompletionScore,

              resume_score:
                readiness.resumeScore,

              requirements_score:
                readiness.requirementsScore,

              skills_score:
                readiness.skillsScore,

              interview_readiness_score:
                readiness.interviewReadinessScore,

              job_readiness_score:
                readiness.jobReadinessScore,
            };
          }
        );

      return res.json({
        success: true,
        applicants,
      });
    }
  );
};

// ============================================================
// GET SINGLE APPLICANT
// ============================================================

exports.getApplicant = (
  req,
  res
) => {
  const { applicant_id } =
    req.params;

  const sql = `
    SELECT
      applicant_id,
      full_name,
      address,
      contact_number,
      classification,
      education,
      work_experience,
      skills,
      created_at,

      resume_uploaded,
      valid_id_uploaded,
      diploma_tor_uploaded,

      profile_completion_score,
      resume_score,
      requirements_score,
      skills_score,
      interview_readiness_score,
      job_readiness_score,

      peso_comment

    FROM applicants
    WHERE applicant_id = ?
    LIMIT 1
  `;

  db.query(
    sql,
    [applicant_id],
    (err, results) => {
      if (err) {
        console.error(
          "GET APPLICANT ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to fetch applicant.",
          error: err.message,
        });
      }

      if (!results.length) {
        return res.status(404).json({
          success: false,
          message:
            "Applicant not found.",
        });
      }

      const applicant =
        results[0];

      const readiness =
        calculateReadiness(
          applicant
        );

      const formattedApplicant = {
        ...applicant,

        resume_uploaded:
          Number(
            applicant.resume_uploaded
          ) || 0,

        valid_id_uploaded:
          Number(
            applicant.valid_id_uploaded
          ) || 0,

        diploma_tor_uploaded:
          Number(
            applicant.diploma_tor_uploaded
          ) || 0,

        profile_completion_score:
          readiness.profileCompletionScore,

        resume_score:
          readiness.resumeScore,

        requirements_score:
          readiness.requirementsScore,

        skills_score:
          readiness.skillsScore,

        interview_readiness_score:
          readiness.interviewReadinessScore,

        job_readiness_score:
          readiness.jobReadinessScore,
      };

      return res.json({
        success: true,
        applicant:
          formattedApplicant,
      });
    }
  );
};

// ============================================================
// ADD APPLICANT
// ============================================================

exports.addApplicant = (
  req,
  res
) => {
  const {
    full_name,
    address,
    contact_number,
    classification,
    education,
    work_experience,
    skills,

    resume_uploaded,
    valid_id_uploaded,
    diploma_tor_uploaded,

    peso_comment,
  } = req.body;

  if (
    !full_name ||
    String(full_name).trim() === ""
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Full name is required.",
    });
  }

  const applicantData = {
    full_name:
      String(full_name).trim(),

    address:
      address || null,

    contact_number:
      contact_number || null,

    classification:
      classification || null,

    education:
      education || null,

    work_experience:
      work_experience || null,

    skills:
      skills || null,

    resume_uploaded:
      Number(
        resume_uploaded
      ) === 1
        ? 1
        : 0,

    valid_id_uploaded:
      Number(
        valid_id_uploaded
      ) === 1
        ? 1
        : 0,

    diploma_tor_uploaded:
      Number(
        diploma_tor_uploaded
      ) === 1
        ? 1
        : 0,

    peso_comment:
      peso_comment || null,
  };

  const temporaryApplicant = {
    ...applicantData,
  };

  const readiness =
    calculateReadiness(
      temporaryApplicant
    );

  const sql = `
    INSERT INTO applicants (
      full_name,
      address,
      contact_number,
      classification,
      education,
      work_experience,
      skills,

      resume_uploaded,
      valid_id_uploaded,
      diploma_tor_uploaded,

      profile_completion_score,
      resume_score,
      requirements_score,
      skills_score,
      interview_readiness_score,
      job_readiness_score,

      peso_comment,
      approval_status,
      submitted_by,
      reviewed_by,
      reviewed_at,
      rejection_reason
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    applicantData.full_name,
    applicantData.address,
    applicantData.contact_number,
    applicantData.classification,
    applicantData.education,
    applicantData.work_experience,
    applicantData.skills,

    applicantData.resume_uploaded,
    applicantData.valid_id_uploaded,
    applicantData.diploma_tor_uploaded,

    readiness.profileCompletionScore,
    readiness.resumeScore,
    readiness.requirementsScore,
    readiness.skillsScore,
    readiness.interviewReadinessScore,
    readiness.jobReadinessScore,

    applicantData.peso_comment,

    getApprovalData(req).approvalStatus,
    getApprovalData(req).submittedBy,
    getApprovalData(req).reviewedBy,
    null,
    null,
  ];

  db.query(
    sql,
    values,
    async (err, result) => {
      if (err) {
        console.error(
          "ADD APPLICANT ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to add applicant.",
          error: err.message,
        });
      }

      // ==========================================
      // ACTIVITY LOG
      // ==========================================

      await createActivityLog(
        req,
        "Applicants",
        `Added applicant: ${applicantData.full_name}.`
      );

      return res.status(201).json({
        success: true,
        message:
          "Applicant added successfully.",
        applicant_id:
          result.insertId,
      });
    }
  );
};

// ============================================================
// UPDATE APPLICANT
// ============================================================

exports.updateApplicant = (
  req,
  res
) => {
  const { applicant_id } =
    req.params;

  const {
    full_name,
    address,
    contact_number,
    classification,
    education,
    work_experience,
    skills,

    resume_uploaded,
    valid_id_uploaded,
    diploma_tor_uploaded,

    peso_comment,
  } = req.body;

  if (
    !full_name ||
    String(full_name).trim() === ""
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Full name is required.",
    });
  }

  const applicantData = {
    full_name:
      String(full_name).trim(),

    address:
      address || null,

    contact_number:
      contact_number || null,

    classification:
      classification || null,

    education:
      education || null,

    work_experience:
      work_experience || null,

    skills:
      skills || null,

    resume_uploaded:
      Number(
        resume_uploaded
      ) === 1
        ? 1
        : 0,

    valid_id_uploaded:
      Number(
        valid_id_uploaded
      ) === 1
        ? 1
        : 0,

    diploma_tor_uploaded:
      Number(
        diploma_tor_uploaded
      ) === 1
        ? 1
        : 0,

    peso_comment:
      peso_comment || null,
  };

  const readiness =
    calculateReadiness(
      applicantData
    );

  const sql = `
    UPDATE applicants
    SET
      full_name = ?,
      address = ?,
      contact_number = ?,
      classification = ?,
      education = ?,
      work_experience = ?,
      skills = ?,

      resume_uploaded = ?,
      valid_id_uploaded = ?,
      diploma_tor_uploaded = ?,

      profile_completion_score = ?,
      resume_score = ?,
      requirements_score = ?,
      skills_score = ?,
      interview_readiness_score = ?,
      job_readiness_score = ?,

      peso_comment = ?,
      approval_status = ?,
      submitted_by = ?,
      reviewed_by = ?,
      reviewed_at = ?,
      rejection_reason = ?

    WHERE applicant_id = ?
  `;

  const values = [
    applicantData.full_name,
    applicantData.address,
    applicantData.contact_number,
    applicantData.classification,
    applicantData.education,
    applicantData.work_experience,
    applicantData.skills,

    applicantData.resume_uploaded,
    applicantData.valid_id_uploaded,
    applicantData.diploma_tor_uploaded,

    readiness.profileCompletionScore,
    readiness.resumeScore,
    readiness.requirementsScore,
    readiness.skillsScore,
    readiness.interviewReadinessScore,
    readiness.jobReadinessScore,

    applicantData.peso_comment,

    getApprovalData(req).approvalStatus,
    getApprovalData(req).submittedBy,
    getApprovalData(req).reviewedBy,
    null,
    null,

    applicant_id,
  ];

  db.query(
    sql,
    values,
    async (err, result) => {
      if (err) {
        console.error(
          "UPDATE APPLICANT ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to update applicant.",
          error: err.message,
        });
      }

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Applicant not found.",
        });
      }

      // ==========================================
      // ACTIVITY LOG
      // ==========================================

      await createActivityLog(
        req,
        "Applicants",
        `Updated applicant: ${applicantData.full_name}.`
      );

      return res.json({
        success: true,
        message:
          "Applicant updated successfully.",
      });
    }
  );
};

// ============================================================
// DELETE APPLICANT
// ============================================================

exports.deleteApplicant = (
  req,
  res
) => {
  const { applicant_id } =
    req.params;

  // First retrieve the applicant name
  // so the activity log can identify
  // which applicant was deleted.

  const findSql = `
    SELECT
      applicant_id,
      full_name
    FROM applicants
    WHERE applicant_id = ?
    LIMIT 1
  `;

  db.query(
    findSql,
    [applicant_id],
    (findErr, findResults) => {
      if (findErr) {
        console.error(
          "FIND APPLICANT BEFORE DELETE ERROR:",
          findErr
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to find applicant.",
          error: findErr.message,
        });
      }

      if (!findResults.length) {
        return res.status(404).json({
          success: false,
          message:
            "Applicant not found.",
        });
      }

      const applicant =
        findResults[0];

      const sql = `
        DELETE FROM applicants
        WHERE applicant_id = ?
      `;

      db.query(
        sql,
        [applicant_id],
        async (err, result) => {
          if (err) {
            console.error(
              "DELETE APPLICANT ERROR:",
              err
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to delete applicant.",
              error: err.message,
            });
          }

          if (
            result.affectedRows === 0
          ) {
            return res.status(404).json({
              success: false,
              message:
                "Applicant not found.",
            });
          }

          // ==========================================
          // ACTIVITY LOG
          // ==========================================

          await createActivityLog(
            req,
            "Applicants",
            `Deleted applicant: ${applicant.full_name}.`
          );

          return res.json({
            success: true,
            message:
              "Applicant deleted successfully.",
          });
        }
      );
    }
  );
};

// ============================================================
// GET APPLICANT REFERRALS
// ============================================================
// IMPORTANT:
// DATE_FORMAT() is intentionally used here.
// MySQL DATE fields can otherwise become JavaScript Date objects
// and then JSON serialization shifts them to UTC.
// Example:
// DB: 2026-09-06
// Without DATE_FORMAT:
// 2026-09-05T16:00:00.000Z
// With DATE_FORMAT:
// 2026-09-06
// ============================================================

exports.getApplicantReferrals = (
  req,
  res
) => {
  const { applicant_id } =
    req.params;

  const sql = `
    SELECT
      r.referral_id,
      r.applicant_id,
      r.vacancy_id,
      r.status,

      DATE_FORMAT(
        r.date_referred,
        '%Y-%m-%d'
      ) AS date_referred,

      DATE_FORMAT(
        r.interview_date,
        '%Y-%m-%d'
      ) AS interview_date,

      r.result,
      r.rejection_reason,

      DATE_FORMAT(
        r.date_contacted,
        '%Y-%m-%d'
      ) AS date_contacted,

      r.contacted_person,
      r.contact_method,
      r.follow_up_result,

      DATE_FORMAT(
        r.next_follow_up,
        '%Y-%m-%d'
      ) AS next_follow_up,

      DATE_FORMAT(
        r.reapply_eligible_date,
        '%Y-%m-%d'
      ) AS reapply_eligible_date,

      r.created_at,
      r.updated_at,

      e.employer_id,
      e.company_name,

      j.position_title,
      j.location,
      j.employment_type

    FROM referrals r

    LEFT JOIN job_vacancies j
      ON r.vacancy_id = j.vacancy_id

    LEFT JOIN employers e
      ON j.employer_id = e.employer_id

    WHERE r.applicant_id = ?

    ORDER BY
      r.date_referred DESC,
      r.referral_id DESC
  `;

  db.query(
    sql,
    [applicant_id],
    (err, result) => {
      if (err) {
        console.error(
          "GET APPLICANT REFERRALS ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to fetch applicant referrals.",
          error: err.message,
        });
      }

      return res.json({
        success: true,
        referrals: result,
      });
    }
  );
};