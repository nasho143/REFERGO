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


// ======================================================
// ACTIVITY LOG HELPER
// ======================================================

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
        "REFERRAL ACTIVITY LOG ERROR:",
        error
      );

      // Activity logging should never
      // prevent the main Referral operation
      // from succeeding.
    });
}

// ======================================================
// ALLOWED REFERRAL STATUSES
// ======================================================

const ALLOWED_STATUSES = [
  "Pending",
  "For Interview",
  "Interview Scheduled",
  "Hired",
  "Rejected",
  "Failed",
  "No Response",
  "Expired",
  "Cancelled",
];

// ======================================================
// HELPER: CHECK VALID DATE
// ======================================================

function isValidDate(value) {
  if (!value) return false;

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

// ======================================================
// HELPER: FORMAT DATE AS YYYY-MM-DD
// ======================================================

function formatDate(date) {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// ======================================================
// HELPER: CALCULATE REAPPLY ELIGIBLE DATE
// ======================================================

function calculateReapplyDate(
  dateReferred,
  cooldownDays
) {
  if (!dateReferred || !cooldownDays) {
    return null;
  }

  const date = new Date(
    `${dateReferred}T00:00:00`
  );

  date.setDate(
    date.getDate() +
      Number(cooldownDays)
  );

  return formatDate(date);
}

// ======================================================
// GET ALL REFERRALS
// ======================================================

exports.getReferrals = (req, res) => {
  const sql = `
    SELECT
      r.referral_id,
      r.applicant_id,
      r.vacancy_id,
      r.status,
      r.approval_status,
      r.submitted_by,
      r.reviewed_by,
      r.reviewed_at,
      r.date_referred,
      r.interview_date,
      r.result,
      r.rejection_reason,
      r.date_contacted,
      r.contacted_person,
      r.contact_method,
      r.follow_up_result,
      r.next_follow_up,
      r.reapply_eligible_date,
      r.created_at,
      r.updated_at,

      a.full_name,
      a.contact_number,
      a.classification,

      e.employer_id,
      e.company_name,
      e.address AS employer_address,
      e.contact_person,
      e.contact_number AS employer_contact_number,
      e.email AS employer_email,

      j.position_title,
      j.qualifications,
      j.requirements,
      j.salary,
      j.location,
      j.employment_type,
      j.deadline,
      j.openings,
      j.status AS vacancy_status

    FROM referrals r

    LEFT JOIN applicants a
      ON r.applicant_id = a.applicant_id

    LEFT JOIN job_vacancies j
      ON r.vacancy_id = j.vacancy_id

    LEFT JOIN employers e
      ON j.employer_id = e.employer_id

    ORDER BY
      r.date_referred DESC,
      r.referral_id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(
        "GET REFERRALS ERROR:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch referrals.",
      });
    }

    return res.json({
      success: true,
      referrals: result,
    });
  });
};

// ======================================================
// ADD REFERRAL
// ======================================================

exports.addReferral = (req, res) => {
  const {
    applicant_id,
    vacancy_id,
    status = "Pending",
    date_referred,
    interview_date,
    result,
    rejection_reason,
    date_contacted,
    contacted_person,
    contact_method,
    follow_up_result,
    next_follow_up,
  } = req.body;

  // ----------------------------------------------------
  // REQUIRED FIELDS
  // ----------------------------------------------------

  if (!applicant_id) {
    return res.status(400).json({
      success: false,
      message:
        "Applicant is required.",
    });
  }

  if (!vacancy_id) {
    return res.status(400).json({
      success: false,
      message:
        "Job vacancy is required.",
    });
  }

  if (!date_referred) {
    return res.status(400).json({
      success: false,
      message:
        "Referral date is required.",
    });
  }

  // ----------------------------------------------------
  // VALIDATE REFERRAL DATE
  // ----------------------------------------------------

  if (!isValidDate(date_referred)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid referral date.",
    });
  }

  // ----------------------------------------------------
  // VALIDATE STATUS
  // ----------------------------------------------------

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid referral status. Allowed statuses: ${ALLOWED_STATUSES.join(
        ", "
      )}`,
    });
  }

  // ----------------------------------------------------
  // VALIDATE INTERVIEW DATE
  // ----------------------------------------------------

  if (
    interview_date &&
    !isValidDate(interview_date)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid interview date.",
    });
  }

  // ----------------------------------------------------
  // VALIDATE FOLLOW-UP DATE
  // ----------------------------------------------------

  if (
    next_follow_up &&
    !isValidDate(next_follow_up)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid next follow-up date.",
    });
  }

  // ----------------------------------------------------
  // CHECK APPLICANT
  // ----------------------------------------------------

  const applicantSql = `
    SELECT
      applicant_id,
      full_name,
      created_at
    FROM applicants
    WHERE applicant_id = ?
    LIMIT 1
  `;

  db.query(
    applicantSql,
    [applicant_id],
    (err, applicantResult) => {
      if (err) {
        console.error(
          "CHECK APPLICANT ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to validate applicant.",
        });
      }

      if (
        applicantResult.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Applicant not found.",
        });
      }

      const applicant =
        applicantResult[0];

      // ------------------------------------------------
      // DATE REFERRED CANNOT BE BEFORE REGISTRATION
      // ------------------------------------------------

      const registrationDate =
        formatDate(
          applicant.created_at
        );

      if (
        date_referred <
        registrationDate
      ) {
        return res.status(400).json({
          success: false,
          message: `Referral date cannot be earlier than the applicant's registration date (${registrationDate}).`,
        });
      }

      // ------------------------------------------------
      // CHECK VACANCY
      // ------------------------------------------------

      const vacancySql = `
        SELECT
          j.vacancy_id,
          j.employer_id,
          j.position_title,
          j.deadline,
          j.status AS vacancy_status,
          e.company_name,
          e.reapply_cooldown_days
        FROM job_vacancies j
        LEFT JOIN employers e
          ON j.employer_id = e.employer_id
        WHERE j.vacancy_id = ?
        LIMIT 1
      `;

      db.query(
        vacancySql,
        [vacancy_id],
        (err, vacancyResult) => {
          if (err) {
            console.error(
              "CHECK VACANCY ERROR:",
              err
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to validate vacancy.",
            });
          }

          if (
            vacancyResult.length === 0
          ) {
            return res.status(404).json({
              success: false,
              message:
                "Job vacancy not found.",
            });
          }

          const vacancy =
            vacancyResult[0];

          // ------------------------------------------------
          // CHECK CLOSED VACANCY
          // ------------------------------------------------

          if (
            vacancy.vacancy_status ===
            "Closed"
          ) {
            return res.status(400).json({
              success: false,
              message:
                "This job vacancy is already closed.",
            });
          }

          // ------------------------------------------------
          // CHECK VACANCY DEADLINE
          // ------------------------------------------------

          if (
            vacancy.deadline &&
            date_referred >
              formatDate(
                vacancy.deadline
              )
          ) {
            return res.status(400).json({
              success: false,
              message: `This vacancy expired on ${formatDate(
                vacancy.deadline
              )}.`,
            });
          }

          // ------------------------------------------------
          // CHECK DUPLICATE ACTIVE REFERRAL
          // ------------------------------------------------

          const duplicateSql = `
            SELECT
              referral_id,
              status,
              date_referred
            FROM referrals
            WHERE applicant_id = ?
              AND vacancy_id = ?
              AND status NOT IN (
                'Rejected',
                'Failed',
                'Expired',
                'Cancelled'
              )
            LIMIT 1
          `;

          db.query(
            duplicateSql,
            [
              applicant_id,
              vacancy_id,
            ],
            (err, duplicateResult) => {
              if (err) {
                console.error(
                  "CHECK DUPLICATE REFERRAL ERROR:",
                  err
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Failed to check duplicate referral.",
                });
              }

              if (
                duplicateResult.length >
                0
              ) {
                const duplicate =
                  duplicateResult[0];

                return res.status(400).json({
                  success: false,
                  message: `This applicant already has an active referral for this position. Current status: ${duplicate.status}.`,
                });
              }

              // ------------------------------------------------
              // CHECK EMPLOYER REAPPLICATION COOLDOWN
              // ------------------------------------------------

              const cooldownSql = `
                SELECT
                  r.referral_id,
                  r.status,
                  r.date_referred,
                  r.reapply_eligible_date,
                  e.company_name
                FROM referrals r
                INNER JOIN job_vacancies j
                  ON r.vacancy_id =
                     j.vacancy_id
                INNER JOIN employers e
                  ON j.employer_id =
                     e.employer_id
                WHERE r.applicant_id = ?
                  AND j.employer_id = ?
                  AND r.status IN (
                    'Rejected',
                    'Failed'
                  )
                  AND r.reapply_eligible_date
                    IS NOT NULL
                  AND r.reapply_eligible_date > ?
                ORDER BY
                  r.reapply_eligible_date DESC
                LIMIT 1
              `;

              db.query(
                cooldownSql,
                [
                  applicant_id,
                  vacancy.employer_id,
                  date_referred,
                ],
                (err, cooldownResult) => {
                  if (err) {
                    console.error(
                      "CHECK REAPPLICATION COOLDOWN ERROR:",
                      err
                    );

                    return res.status(500).json({
                      success: false,
                      message:
                        "Failed to check reapplication cooldown.",
                    });
                  }

                  if (
                    cooldownResult.length >
                    0
                  ) {
                    const cooldown =
                      cooldownResult[0];

                    return res.status(400).json({
                      success: false,
                      message: `Applicant cannot reapply to ${cooldown.company_name} until ${formatDate(
                        cooldown.reapply_eligible_date
                      )}.`,
                    });
                  }

                  // ------------------------------------------------
                  // CALCULATE REAPPLY DATE
                  // ------------------------------------------------

                  let reapplyEligibleDate =
                    null;

                  if (
                    status === "Rejected" ||
                    status === "Failed"
                  ) {
                    reapplyEligibleDate =
                      calculateReapplyDate(
                        date_referred,
                        vacancy.reapply_cooldown_days ||
                          90
                      );
                  }

                  // ------------------------------------------------
                  // INSERT REFERRAL
                  // ------------------------------------------------

                  const insertSql = `
                    INSERT INTO referrals (
                      applicant_id,
                      vacancy_id,
                      status,
                      approval_status,
                      submitted_by,
                      reviewed_by,
                      reviewed_at,
                      date_referred,
                      interview_date,
                      result,
                      rejection_reason,
                      date_contacted,
                      contacted_person,
                      contact_method,
                      follow_up_result,
                      next_follow_up,
                      reapply_eligible_date
                    )
                    VALUES (
                      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                  `;

                  const values = [
                    applicant_id,
                    vacancy_id,
                    status,
                    getApprovalData(req).approvalStatus,
                    getApprovalData(req).submittedBy,
                    getApprovalData(req).reviewedBy,
                    null,
                    date_referred,
                    interview_date || null,
                    result || null,
                    rejection_reason || null,
                    date_contacted || null,
                    contacted_person || null,
                    contact_method || null,
                    follow_up_result || null,
                    next_follow_up || null,
                    reapplyEligibleDate,
                  ];

                  db.query(
                    insertSql,
                    values,
                    async (
                      err,
                      insertResult
                    ) => {
                      if (err) {
                        console.error(
                          "ADD REFERRAL ERROR:",
                          err
                        );

                        return res.status(500).json({
                          success: false,
                          message:
                            "Failed to add referral.",
                        });
                      }

                      // ==========================================
                      // ACTIVITY LOG
                      // ==========================================

                      const applicantName =
                        applicant.full_name ||
                        `Applicant #${applicant_id}`;

                      const companyName =
                        vacancy.company_name ||
                        "Unknown employer";

                      const positionTitle =
                        vacancy.position_title ||
                        "Unknown position";

                      await createActivityLog(
                        req,
                        "Referrals",
                        `Added referral: ${applicantName} → ${companyName} - ${positionTitle}.`
                      );

                      return res.status(201).json({
                        success: true,
                        message:
                          "Referral added successfully.",
                        referral_id:
                          insertResult.insertId,
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

// ======================================================
// UPDATE REFERRAL
// ======================================================

exports.updateReferral = (
  req,
  res
) => {
  const { referral_id } =
    req.params;

  const {
    applicant_id,
    vacancy_id,
    status = "Pending",
    date_referred,
    interview_date,
    result,
    rejection_reason,
    date_contacted,
    contacted_person,
    contact_method,
    follow_up_result,
    next_follow_up,
  } = req.body;

  // ----------------------------------------------------
  // VALIDATE REFERRAL ID
  // ----------------------------------------------------

  if (!referral_id) {
    return res.status(400).json({
      success: false,
      message:
        "Referral ID is required.",
    });
  }

  // ----------------------------------------------------
  // REQUIRED FIELDS
  // ----------------------------------------------------

  if (!applicant_id) {
    return res.status(400).json({
      success: false,
      message:
        "Applicant is required.",
    });
  }

  if (!vacancy_id) {
    return res.status(400).json({
      success: false,
      message:
        "Job vacancy is required.",
    });
  }

  if (!date_referred) {
    return res.status(400).json({
      success: false,
      message:
        "Referral date is required.",
    });
  }

  // ----------------------------------------------------
  // VALIDATE DATE
  // ----------------------------------------------------

  if (!isValidDate(date_referred)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid referral date.",
    });
  }

  if (
    interview_date &&
    !isValidDate(interview_date)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid interview date.",
    });
  }

  if (
    next_follow_up &&
    !isValidDate(next_follow_up)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid next follow-up date.",
    });
  }

  // ----------------------------------------------------
  // VALIDATE STATUS
  // ----------------------------------------------------

  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid referral status. Allowed statuses: ${ALLOWED_STATUSES.join(
        ", "
      )}`,
    });
  }

  // ----------------------------------------------------
  // CHECK EXISTING REFERRAL
  // ----------------------------------------------------

  const existingSql = `
    SELECT
      referral_id,
      applicant_id,
      vacancy_id,
      status,
      date_referred,
      reapply_eligible_date
    FROM referrals
    WHERE referral_id = ?
    LIMIT 1
  `;

  db.query(
    existingSql,
    [referral_id],
    (err, existingResult) => {
      if (err) {
        console.error(
          "CHECK EXISTING REFERRAL ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to find referral.",
        });
      }

      if (
        existingResult.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Referral not found.",
        });
      }

      // ------------------------------------------------
      // CHECK APPLICANT
      // ------------------------------------------------

      const applicantSql = `
        SELECT
          applicant_id,
          full_name,
          created_at
        FROM applicants
        WHERE applicant_id = ?
        LIMIT 1
      `;

      db.query(
        applicantSql,
        [applicant_id],
        (err, applicantResult) => {
          if (err) {
            console.error(
              "CHECK APPLICANT UPDATE ERROR:",
              err
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to validate applicant.",
            });
          }

          if (
            applicantResult.length === 0
          ) {
            return res.status(404).json({
              success: false,
              message:
                "Applicant not found.",
            });
          }

          const applicant =
            applicantResult[0];

          // ------------------------------------------------
          // DATE REFERRED CANNOT BE BEFORE REGISTRATION
          // ------------------------------------------------

          const registrationDate =
            formatDate(
              applicant.created_at
            );

          if (
            date_referred <
            registrationDate
          ) {
            return res.status(400).json({
              success: false,
              message: `Referral date cannot be earlier than the applicant's registration date (${registrationDate}).`,
            });
          }

          // ------------------------------------------------
          // CHECK VACANCY
          // ------------------------------------------------

          const vacancySql = `
            SELECT
              j.vacancy_id,
              j.employer_id,
              j.position_title,
              j.deadline,
              j.status AS vacancy_status,
              e.company_name,
              e.reapply_cooldown_days
            FROM job_vacancies j
            LEFT JOIN employers e
              ON j.employer_id =
                 e.employer_id
            WHERE j.vacancy_id = ?
            LIMIT 1
          `;

          db.query(
            vacancySql,
            [vacancy_id],
            (err, vacancyResult) => {
              if (err) {
                console.error(
                  "CHECK VACANCY UPDATE ERROR:",
                  err
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Failed to validate vacancy.",
                });
              }

              if (
                vacancyResult.length === 0
              ) {
                return res.status(404).json({
                  success: false,
                  message:
                    "Job vacancy not found.",
                });
              }

              const vacancy =
                vacancyResult[0];

              // ------------------------------------------------
              // CLOSED VACANCY
              // ------------------------------------------------

              if (
                vacancy.vacancy_status ===
                "Closed"
              ) {
                return res.status(400).json({
                  success: false,
                  message:
                    "This job vacancy is already closed.",
                });
              }

              // ------------------------------------------------
              // DEADLINE
              // ------------------------------------------------

              if (
                vacancy.deadline &&
                date_referred >
                  formatDate(
                    vacancy.deadline
                  )
              ) {
                return res.status(400).json({
                  success: false,
                  message: `This vacancy expired on ${formatDate(
                    vacancy.deadline
                  )}.`,
                });
              }

              // ------------------------------------------------
              // DUPLICATE ACTIVE REFERRAL
              // EXCLUDE CURRENT REFERRAL
              // ------------------------------------------------

              const duplicateSql = `
                SELECT
                  referral_id,
                  status,
                  date_referred
                FROM referrals
                WHERE applicant_id = ?
                  AND vacancy_id = ?
                  AND referral_id != ?
                  AND status NOT IN (
                    'Rejected',
                    'Failed',
                    'Expired',
                    'Cancelled'
                  )
                LIMIT 1
              `;

              db.query(
                duplicateSql,
                [
                  applicant_id,
                  vacancy_id,
                  referral_id,
                ],
                (err, duplicateResult) => {
                  if (err) {
                    console.error(
                      "CHECK UPDATE DUPLICATE ERROR:",
                      err
                    );

                    return res.status(500).json({
                      success: false,
                      message:
                        "Failed to check duplicate referral.",
                    });
                  }

                  if (
                    duplicateResult.length >
                    0
                  ) {
                    const duplicate =
                      duplicateResult[0];

                    return res.status(400).json({
                      success: false,
                      message: `This applicant already has another active referral for this position. Current status: ${duplicate.status}.`,
                    });
                  }

                  // ------------------------------------------------
                  // CHECK REAPPLICATION COOLDOWN
                  // EXCLUDE CURRENT REFERRAL
                  // ------------------------------------------------

                  const cooldownSql = `
                    SELECT
                      r.referral_id,
                      r.status,
                      r.date_referred,
                      r.reapply_eligible_date,
                      e.company_name
                    FROM referrals r
                    INNER JOIN job_vacancies j
                      ON r.vacancy_id =
                         j.vacancy_id
                    INNER JOIN employers e
                      ON j.employer_id =
                         e.employer_id
                    WHERE r.applicant_id = ?
                      AND j.employer_id = ?
                      AND r.referral_id != ?
                      AND r.status IN (
                        'Rejected',
                        'Failed'
                      )
                      AND r.reapply_eligible_date
                        IS NOT NULL
                      AND r.reapply_eligible_date > ?
                    ORDER BY
                      r.reapply_eligible_date DESC
                    LIMIT 1
                  `;

                  db.query(
                    cooldownSql,
                    [
                      applicant_id,
                      vacancy.employer_id,
                      referral_id,
                      date_referred,
                    ],
                    (err, cooldownResult) => {
                      if (err) {
                        console.error(
                          "CHECK UPDATE COOLDOWN ERROR:",
                          err
                        );

                        return res
                          .status(500)
                          .json({
                            success: false,
                            message:
                              "Failed to check reapplication cooldown.",
                          });
                      }

                      if (
                        cooldownResult.length >
                        0
                      ) {
                        const cooldown =
                          cooldownResult[0];

                        return res.status(400).json({
                          success: false,
                          message: `Applicant cannot reapply to ${cooldown.company_name} until ${formatDate(
                            cooldown.reapply_eligible_date
                          )}.`,
                        });
                      }

                      // ------------------------------------------------
                      // CALCULATE REAPPLY DATE
                      // ------------------------------------------------

                      let reapplyEligibleDate =
                        null;

                      if (
                        status ===
                          "Rejected" ||
                        status === "Failed"
                      ) {
                        reapplyEligibleDate =
                          calculateReapplyDate(
                            date_referred,
                            vacancy.reapply_cooldown_days ||
                              90
                          );
                      }

                      // ------------------------------------------------
                      // UPDATE REFERRAL
                      // ------------------------------------------------

                      const approvalData = getApprovalData(req);

                      const updateSql = `
                        UPDATE referrals
                        SET
                          applicant_id = ?,
                          vacancy_id = ?,
                          status = ?,
                          approval_status = ?,
                          submitted_by = ?,
                          reviewed_by = ?,
                          reviewed_at = ?,
                          rejection_reason = ?,
                          date_referred = ?,
                          interview_date = ?,
                          result = ?,
                          date_contacted = ?,
                          contacted_person = ?,
                          contact_method = ?,
                          follow_up_result = ?,
                          next_follow_up = ?,
                          reapply_eligible_date = ?
                        WHERE referral_id = ?
                      `;

                      const values = [
                        applicant_id,
                        vacancy_id,
                        status,
                        approvalData.approvalStatus,
                        approvalData.submittedBy,
                        approvalData.reviewedBy,
                        null,
                        rejection_reason || null,
                        date_referred,
                        interview_date || null,
                        result || null,
                        date_contacted || null,
                        contacted_person || null,
                        contact_method || null,
                        follow_up_result || null,
                        next_follow_up || null,
                        reapplyEligibleDate,
                        referral_id,
                      ];

                      db.query(
                        updateSql,
                        values,
                        async (err) => {
                          if (err) {
                            console.error(
                              "UPDATE REFERRAL ERROR:",
                              err
                            );

                            return res.status(500).json({
                              success: false,
                              message:
                                "Failed to update referral.",
                            });
                          }

                          // ==========================================
                          // ACTIVITY LOG
                          // ==========================================

                          const applicantName =
                            applicant.full_name ||
                            `Applicant #${applicant_id}`;

                          const companyName =
                            vacancy.company_name ||
                            "Unknown employer";

                          const positionTitle =
                            vacancy.position_title ||
                            "Unknown position";

                          await createActivityLog(
                            req,
                            "Referrals",
                            `Updated referral: ${applicantName} → ${companyName} - ${positionTitle}.`
                          );

                          return res.json({
                            success: true,
                            message:
                              "Referral updated successfully.",
                          });
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

// ======================================================
// DELETE REFERRAL
// ======================================================

exports.deleteReferral = (
  req,
  res
) => {
  const { referral_id } =
    req.params;

  if (!referral_id) {
    return res.status(400).json({
      success: false,
      message:
        "Referral ID is required.",
    });
  }

  // ----------------------------------------------------
  // GET REFERRAL DETAILS BEFORE DELETE
  // This allows the activity log to identify
  // which referral was deleted.
  // ----------------------------------------------------

  const findSql = `
    SELECT
      r.referral_id,
      r.applicant_id,
      r.vacancy_id,

      a.full_name,

      j.position_title,

      e.company_name

    FROM referrals r

    LEFT JOIN applicants a
      ON r.applicant_id =
         a.applicant_id

    LEFT JOIN job_vacancies j
      ON r.vacancy_id =
         j.vacancy_id

    LEFT JOIN employers e
      ON j.employer_id =
         e.employer_id

    WHERE r.referral_id = ?

    LIMIT 1
  `;

  db.query(
    findSql,
    [referral_id],
    (findErr, findResults) => {
      if (findErr) {
        console.error(
          "FIND REFERRAL BEFORE DELETE ERROR:",
          findErr
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to find referral.",
        });
      }

      if (
        findResults.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Referral not found.",
        });
      }

      const referral =
        findResults[0];

      // ------------------------------------------------
      // DELETE REFERRAL
      // ------------------------------------------------

      const sql = `
        DELETE FROM referrals
        WHERE referral_id = ?
      `;

      db.query(
        sql,
        [referral_id],
        async (err, result) => {
          if (err) {
            console.error(
              "DELETE REFERRAL ERROR:",
              err
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to delete referral.",
            });
          }

          if (
            result.affectedRows === 0
          ) {
            return res.status(404).json({
              success: false,
              message:
                "Referral not found.",
            });
          }

          // ==========================================
          // ACTIVITY LOG
          // ==========================================

          const applicantName =
            referral.full_name ||
            `Applicant #${referral.applicant_id}`;

          const companyName =
            referral.company_name ||
            "Unknown employer";

          const positionTitle =
            referral.position_title ||
            "Unknown position";

          await createActivityLog(
            req,
            "Referrals",
            `Deleted referral: ${applicantName} → ${companyName} - ${positionTitle}.`
          );

          return res.json({
            success: true,
            message:
              "Referral deleted successfully.",
          });
        }
      );
    }
  );
};

// ======================================================
// GET REFERRALS OF ONE APPLICANT
// USED BY APPLICANT VIEW MODAL / CAREER JOURNEY
// ======================================================

exports.getApplicantReferrals = (
  req,
  res
) => {
  const { applicant_id } =
    req.params;

  if (!applicant_id) {
    return res.status(400).json({
      success: false,
      message:
        "Applicant ID is required.",
    });
  }

  const sql = `
    SELECT
      r.referral_id,
      r.applicant_id,
      r.vacancy_id,
      r.status,
      r.date_referred,
      r.interview_date,
      r.result,
      r.rejection_reason,
      r.date_contacted,
      r.contacted_person,
      r.contact_method,
      r.follow_up_result,
      r.next_follow_up,
      r.reapply_eligible_date,
      r.created_at,
      r.updated_at,

      e.employer_id,
      e.company_name,

      j.position_title,
      j.location,
      j.employment_type

    FROM referrals r

    LEFT JOIN job_vacancies j
      ON r.vacancy_id =
         j.vacancy_id

    LEFT JOIN employers e
      ON j.employer_id =
         e.employer_id

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
            "Failed to fetch applicant referral history.",
        });
      }

      return res.json({
        success: true,
        referrals: result,
      });
    }
  );
};