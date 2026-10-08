const db = require("../config/db");

// ==========================================
// GET FOLLOW-UP MONITORING
// ==========================================
const getFollowUps = (req, res) => {
  const sql = `
    SELECT
      r.referral_id,
      r.applicant_id,
      a.full_name,
      a.contact_number,
      a.classification,

      r.vacancy_id,
      j.position_title,

      e.employer_id,
      e.company_name,
      e.contact_person AS employer_contact_person,

      r.status,
      r.date_referred,
      r.interview_date,

      r.date_contacted,
      r.contacted_person,
      r.contact_method,
      r.follow_up_result,
      r.next_follow_up,

      r.reapply_eligible_date,

      r.created_at,
      r.updated_at

    FROM referrals r

    LEFT JOIN applicants a
      ON r.applicant_id = a.applicant_id

    LEFT JOIN job_vacancies j
      ON r.vacancy_id = j.vacancy_id

    LEFT JOIN employers e
      ON j.employer_id = e.employer_id

    WHERE r.status NOT IN (
      'Hired',
      'Rejected',
      'Failed',
      'Cancelled',
      'Expired'
    )

    ORDER BY
      CASE
        WHEN r.next_follow_up IS NOT NULL
             AND r.next_follow_up < CURDATE()
        THEN 1

        WHEN r.next_follow_up = CURDATE()
        THEN 2

        WHEN r.next_follow_up IS NOT NULL
        THEN 3

        ELSE 4
      END,

      r.next_follow_up ASC,

      r.referral_id DESC
  `;

  db.query(sql, (error, results) => {
    if (error) {
      console.error(
        "GET FOLLOW-UPS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to load follow-up monitoring.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      followUps: results,
    });
  });
};


// ==========================================
// GET SINGLE FOLLOW-UP
// ==========================================
const getFollowUp = (req, res) => {
  const { referral_id } = req.params;

  if (!referral_id) {
    return res.status(400).json({
      success: false,
      message: "Referral ID is required.",
    });
  }

  const sql = `
    SELECT
      r.referral_id,
      r.applicant_id,
      a.full_name,
      a.contact_number,
      a.classification,

      r.vacancy_id,
      j.position_title,

      e.employer_id,
      e.company_name,
      e.contact_person AS employer_contact_person,
      e.contact_number AS employer_contact_number,
      e.email AS employer_email,

      r.status,
      r.date_referred,
      r.interview_date,

      r.date_contacted,
      r.contacted_person,
      r.contact_method,
      r.follow_up_result,
      r.next_follow_up,

      r.reapply_eligible_date,

      r.created_at,
      r.updated_at

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
    (error, results) => {
      if (error) {
        console.error(
          "GET FOLLOW-UP ERROR:",
          error
        );

        return res.status(500).json({
          success: false,
          message: "Failed to load follow-up.",
          error: error.message,
        });
      }

      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Referral not found.",
        });
      }

      return res.status(200).json({
        success: true,
        followUp: results[0],
      });
    }
  );
};


// ==========================================
// UPDATE FOLLOW-UP INFORMATION
// ==========================================
const updateFollowUp = (req, res) => {
  const { referral_id } = req.params;

  const {
    date_contacted,
    contacted_person,
    contact_method,
    follow_up_result,
    next_follow_up,
  } = req.body;

  if (!referral_id) {
    return res.status(400).json({
      success: false,
      message: "Referral ID is required.",
    });
  }

  // ========================================
  // BASIC DATE VALIDATION
  // ========================================

  if (
    date_contacted &&
    !/^\d{4}-\d{2}-\d{2}$/.test(
      String(date_contacted)
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Date contacted must use YYYY-MM-DD format.",
    });
  }

  if (
    next_follow_up &&
    !/^\d{4}-\d{2}-\d{2}$/.test(
      String(next_follow_up)
    )
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Next follow-up must use YYYY-MM-DD format.",
    });
  }

  // ========================================
  // UPDATE
  // ========================================

  const sql = `
    UPDATE referrals
    SET
      date_contacted = ?,
      contacted_person = ?,
      contact_method = ?,
      follow_up_result = ?,
      next_follow_up = ?
    WHERE referral_id = ?
  `;

  const values = [
    date_contacted || null,
    contacted_person?.trim() || null,
    contact_method?.trim() || null,
    follow_up_result?.trim() || null,
    next_follow_up || null,
    referral_id,
  ];

  db.query(
    sql,
    values,
    (error, result) => {
      if (error) {
        console.error(
          "UPDATE FOLLOW-UP ERROR:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to update follow-up information.",
          error: error.message,
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Referral not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Follow-up information updated successfully.",
      });
    }
  );
};


// ==========================================
// GET FOLLOW-UP SUMMARY
// ==========================================
const getFollowUpSummary = (req, res) => {
  const sql = `
    SELECT
      COUNT(*) AS total,

      SUM(
        CASE
          WHEN next_follow_up < CURDATE()
          THEN 1
          ELSE 0
        END
      ) AS overdue,

      SUM(
        CASE
          WHEN next_follow_up = CURDATE()
          THEN 1
          ELSE 0
        END
      ) AS due_today,

      SUM(
        CASE
          WHEN next_follow_up > CURDATE()
          THEN 1
          ELSE 0
        END
      ) AS upcoming,

      SUM(
        CASE
          WHEN next_follow_up IS NULL
          THEN 1
          ELSE 0
        END
      ) AS no_follow_up

    FROM referrals

    WHERE status NOT IN (
      'Hired',
      'Rejected',
      'Failed',
      'Cancelled',
      'Expired'
    )
  `;

  db.query(
    sql,
    (error, results) => {
      if (error) {
        console.error(
          "GET FOLLOW-UP SUMMARY ERROR:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Failed to load follow-up summary.",
          error: error.message,
        });
      }

      return res.status(200).json({
        success: true,
        summary: results[0] || {
          total: 0,
          overdue: 0,
          due_today: 0,
          upcoming: 0,
          no_follow_up: 0,
        },
      });
    }
  );
};


// ==========================================
// EXPORT
// ==========================================
module.exports = {
  getFollowUps,
  getFollowUp,
  updateFollowUp,
  getFollowUpSummary,
};