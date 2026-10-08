const db = require("../config/db");

// ======================================================
// GET EMPLOYER RESPONSE MONITORING
// ======================================================

exports.getEmployerResponses = (req, res) => {
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

      a.full_name AS applicant_name,
      a.contact_number AS applicant_contact,
      a.classification AS applicant_classification,

      e.employer_id,
      e.company_name,
      e.contact_person AS employer_contact_person,
      e.contact_number AS employer_contact_number,
      e.email AS employer_email,

      j.position_title,
      j.location,
      j.employment_type,
      j.deadline,
      j.status AS vacancy_status

    FROM referrals r

    LEFT JOIN applicants a
      ON r.applicant_id = a.applicant_id

    LEFT JOIN job_vacancies j
      ON r.vacancy_id = j.vacancy_id

    LEFT JOIN employers e
      ON j.employer_id = e.employer_id

    ORDER BY
      CASE
        WHEN r.status = 'Pending' THEN 1
        WHEN r.status = 'No Response' THEN 2
        WHEN r.status = 'For Interview' THEN 3
        WHEN r.status = 'Interview Scheduled' THEN 4
        WHEN r.status = 'Hired' THEN 5
        WHEN r.status = 'Rejected' THEN 6
        WHEN r.status = 'Failed' THEN 7
        WHEN r.status = 'Expired' THEN 8
        WHEN r.status = 'Cancelled' THEN 9
        ELSE 10
      END,

      r.next_follow_up ASC,
      r.date_referred DESC,
      r.referral_id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(
        "GET EMPLOYER RESPONSES ERROR:",
        err
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch employer response monitoring data.",
      });
    }

    return res.json({
      success: true,
      responses: result,
    });
  });
};

// ======================================================
// GET EMPLOYER RESPONSE SUMMARY
// ======================================================

exports.getEmployerResponseSummary = (req, res) => {
  const summarySql = `
    SELECT
      COUNT(*) AS total_referrals,

      SUM(
        CASE
          WHEN status = 'Pending'
          THEN 1
          ELSE 0
        END
      ) AS pending,

      SUM(
        CASE
          WHEN status = 'No Response'
          THEN 1
          ELSE 0
        END
      ) AS no_response,

      SUM(
        CASE
          WHEN status = 'For Interview'
            OR status = 'Interview Scheduled'
          THEN 1
          ELSE 0
        END
      ) AS interviewed_pending,

      SUM(
        CASE
          WHEN interview_date IS NOT NULL
          THEN 1
          ELSE 0
        END
      ) AS interviewed,

      SUM(
        CASE
          WHEN status = 'Hired'
          THEN 1
          ELSE 0
        END
      ) AS hired,

      SUM(
        CASE
          WHEN status = 'Rejected'
          THEN 1
          ELSE 0
        END
      ) AS rejected,

      SUM(
        CASE
          WHEN status = 'Failed'
          THEN 1
          ELSE 0
        END
      ) AS failed,

      SUM(
        CASE
          WHEN status = 'Expired'
          THEN 1
          ELSE 0
        END
      ) AS expired,

      SUM(
        CASE
          WHEN status = 'Cancelled'
          THEN 1
          ELSE 0
        END
      ) AS cancelled

    FROM referrals
  `;

  db.query(
    summarySql,
    (err, result) => {
      if (err) {
        console.error(
          "GET EMPLOYER RESPONSE SUMMARY ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to fetch employer response summary.",
        });
      }

      const summary =
        result[0] || {};

      return res.json({
        success: true,

        summary: {
          totalReferrals:
            Number(
              summary.total_referrals
            ) || 0,

          pending:
            Number(
              summary.pending
            ) || 0,

          noResponse:
            Number(
              summary.no_response
            ) || 0,

          interviewedPending:
            Number(
              summary.interviewed_pending
            ) || 0,

          interviewed:
            Number(
              summary.interviewed
            ) || 0,

          hired:
            Number(
              summary.hired
            ) || 0,

          rejected:
            Number(
              summary.rejected
            ) || 0,

          failed:
            Number(
              summary.failed
            ) || 0,

          expired:
            Number(
              summary.expired
            ) || 0,

          cancelled:
            Number(
              summary.cancelled
            ) || 0,
        },
      });
    }
  );
};

// ======================================================
// GET ONE EMPLOYER RESPONSE RECORD
// ======================================================

exports.getEmployerResponse = (
  req,
  res
) => {
  const {
    referral_id,
  } = req.params;

  if (!referral_id) {
    return res.status(400).json({
      success: false,
      message:
        "Referral ID is required.",
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

      a.full_name AS applicant_name,
      a.contact_number AS applicant_contact,
      a.classification AS applicant_classification,

      e.employer_id,
      e.company_name,
      e.contact_person AS employer_contact_person,
      e.contact_number AS employer_contact_number,
      e.email AS employer_email,

      j.position_title,
      j.location,
      j.employment_type,
      j.deadline,
      j.status AS vacancy_status

    FROM referrals r

    LEFT JOIN applicants a
      ON r.applicant_id = a.applicant_id

    LEFT JOIN job_vacancies j
      ON r.vacancy_id = j.vacancy_id

    LEFT JOIN employers e
      ON j.employer_id = e.employer_id

    WHERE r.referral_id = ?

    LIMIT 1
  `;

  db.query(
    sql,
    [referral_id],
    (err, result) => {
      if (err) {
        console.error(
          "GET EMPLOYER RESPONSE ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to fetch employer response record.",
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Employer response record not found.",
        });
      }

      return res.json({
        success: true,
        response: result[0],
      });
    }
  );
};

// ======================================================
// UPDATE EMPLOYER RESPONSE
// PESO STAFF ONLY
// ======================================================

exports.updateEmployerResponse = (
  req,
  res
) => {
  const {
    referral_id,
  } = req.params;

  const {
    status,
    result,
    rejection_reason,
    interview_date,

    date_contacted,
    contacted_person,
    contact_method,
    follow_up_result,
    next_follow_up,
  } = req.body;

  if (!referral_id) {
    return res.status(400).json({
      success: false,
      message:
        "Referral ID is required.",
    });
  }

  // ----------------------------------------------------
  // VALID STATUS
  // ----------------------------------------------------

  const allowedStatuses = [
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

  if (
    status &&
    !allowedStatuses.includes(status)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid referral status.",
    });
  }

  // ----------------------------------------------------
  // CHECK EXISTING REFERRAL
  // ----------------------------------------------------

  const checkSql = `
    SELECT
      referral_id,
      status
    FROM referrals
    WHERE referral_id = ?
    LIMIT 1
  `;

  db.query(
    checkSql,
    [referral_id],
    (err, existingResult) => {
      if (err) {
        console.error(
          "CHECK EMPLOYER RESPONSE ERROR:",
          err
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to validate referral.",
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
      // UPDATE
      // ------------------------------------------------

      const updateSql = `
        UPDATE referrals
        SET
          status = COALESCE(?, status),
          result = ?,
          rejection_reason = ?,
          interview_date = ?,

          date_contacted = ?,
          contacted_person = ?,
          contact_method = ?,
          follow_up_result = ?,
          next_follow_up = ?

        WHERE referral_id = ?
      `;

      const values = [
        status || null,
        result || null,
        rejection_reason || null,
        interview_date || null,

        date_contacted || null,
        contacted_person || null,
        contact_method || null,
        follow_up_result || null,
        next_follow_up || null,

        referral_id,
      ];

      db.query(
        updateSql,
        values,
        (err) => {
          if (err) {
            console.error(
              "UPDATE EMPLOYER RESPONSE ERROR:",
              err
            );

            return res.status(500).json({
              success: false,
              message:
                "Failed to update employer response.",
            });
          }

          return res.json({
            success: true,
            message:
              "Employer response updated successfully.",
          });
        }
      );
    }
  );
};