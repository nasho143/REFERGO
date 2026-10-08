const db = require("../config/db");

// ======================================================
// DASHBOARD QUERY HELPERS
// ======================================================
const query = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

const safeQuery = async (sql, params = [], fallback = []) => {
  try {
    return await query(sql, params);
  } catch (error) {
    console.error("DASHBOARD QUERY ERROR:", error.message);
    return fallback;
  }
};

const countApprovalStatus = async (table, status) => {
  const rows = await safeQuery(
    `
      SELECT COUNT(*) AS total
      FROM ${table}
      WHERE LOWER(TRIM(COALESCE(approval_status, ''))) = ?
    `,
    [status.toLowerCase()]
  );

  return Number(rows[0]?.total) || 0;
};

const getApprovalCounts = async (table) => {
  const rows = await safeQuery(`
    SELECT
      LOWER(TRIM(COALESCE(approval_status, ''))) AS approval_status,
      COUNT(*) AS total
    FROM ${table}
    GROUP BY LOWER(TRIM(COALESCE(approval_status, '')))
  `);

  const result = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };

  rows.forEach((row) => {
    if (row.approval_status === "pending") result.pending = Number(row.total) || 0;
    if (row.approval_status === "approved") result.approved = Number(row.total) || 0;
    if (row.approval_status === "rejected") result.rejected = Number(row.total) || 0;
  });

  return result;
};

const getDashboard = async (req, res) => {
  try {
    const role = String(req.user?.role || "peso_staff").trim().toLowerCase();
    const isDepartmentHead = role === "department_head";

    // ==================================================
    // MAIN STATISTICS
    // ==================================================
    const [
      applicantsResult,
      employersResult,
      vacanciesResult,
      referralsResult,
      activeVacanciesResult,
    ] = await Promise.all([
      safeQuery("SELECT COUNT(*) AS total FROM applicants"),
      safeQuery("SELECT COUNT(*) AS total FROM employers"),
      safeQuery("SELECT COUNT(*) AS total FROM job_vacancies"),
      safeQuery("SELECT COUNT(*) AS total FROM referrals"),
      safeQuery(`
        SELECT COUNT(*) AS total
        FROM job_vacancies
        WHERE LOWER(TRIM(COALESCE(status, ''))) = 'active'
      `),
    ]);

    // ==================================================
    // APPROVAL SUMMARY
    // ==================================================
    const [applicantsApproval, employersApproval, vacanciesApproval, referralsApproval] =
      await Promise.all([
        getApprovalCounts("applicants"),
        getApprovalCounts("employers"),
        getApprovalCounts("job_vacancies"),
        getApprovalCounts("referrals"),
      ]);

    const pendingApprovals = {
      applicants: applicantsApproval.pending,
      employers: employersApproval.pending,
      vacancies: vacanciesApproval.pending,
      referrals: referralsApproval.pending,
      total:
        applicantsApproval.pending +
        employersApproval.pending +
        vacanciesApproval.pending +
        referralsApproval.pending,
    };

    const approvalSummary = {
      pending: pendingApprovals.total,
      approved:
        applicantsApproval.approved +
        employersApproval.approved +
        vacanciesApproval.approved +
        referralsApproval.approved,
      rejected:
        applicantsApproval.rejected +
        employersApproval.rejected +
        vacanciesApproval.rejected +
        referralsApproval.rejected,
    };

    // ==================================================
    // PENDING APPROVAL RECORDS
    // Department Head only needs actionable records.
    // ==================================================
    let pendingApprovalRecords = [];

    if (isDepartmentHead) {
      pendingApprovalRecords = await safeQuery(`
        SELECT * FROM (
          SELECT
            'Applicant' AS record_type,
            a.applicant_id AS record_id,
            a.full_name AS record_name,
            NULL AS secondary_name,
            a.created_at AS submitted_at
          FROM applicants a
          WHERE LOWER(TRIM(COALESCE(a.approval_status, ''))) = 'pending'

          UNION ALL

          SELECT
            'Employer' AS record_type,
            e.employer_id AS record_id,
            e.company_name AS record_name,
            e.contact_person AS secondary_name,
            e.created_at AS submitted_at
          FROM employers e
          WHERE LOWER(TRIM(COALESCE(e.approval_status, ''))) = 'pending'

          UNION ALL

          SELECT
            'Job Vacancy' AS record_type,
            v.vacancy_id AS record_id,
            v.position_title AS record_name,
            e.company_name AS secondary_name,
            v.created_at AS submitted_at
          FROM job_vacancies v
          LEFT JOIN employers e ON e.employer_id = v.employer_id
          WHERE LOWER(TRIM(COALESCE(v.approval_status, ''))) = 'pending'

          UNION ALL

          SELECT
            'Referral' AS record_type,
            r.referral_id AS record_id,
            a.full_name AS record_name,
            j.position_title AS secondary_name,
            r.created_at AS submitted_at
          FROM referrals r
          LEFT JOIN applicants a ON a.applicant_id = r.applicant_id
          LEFT JOIN job_vacancies j ON j.vacancy_id = r.vacancy_id
          WHERE LOWER(TRIM(COALESCE(r.approval_status, ''))) = 'pending'
        ) AS pending_records
        ORDER BY submitted_at DESC, record_id DESC
        LIMIT 12
      `);
    }

    // ==================================================
    // REFERRAL STATUS
    // ==================================================
    const statusResult = await safeQuery(`
      SELECT status, COUNT(*) AS total
      FROM referrals
      GROUP BY status
      ORDER BY total DESC
    `);

    // ==================================================
    // RECENT REFERRALS
    // ==================================================
    const recentReferralsResult = await safeQuery(`
      SELECT
        r.referral_id,
        r.applicant_id,
        r.vacancy_id,
        r.status,
        r.date_referred,
        r.interview_date,
        r.result,
        r.rejection_reason,
        a.full_name,
        j.position_title,
        e.company_name
      FROM referrals r
      LEFT JOIN applicants a ON r.applicant_id = a.applicant_id
      LEFT JOIN job_vacancies j ON r.vacancy_id = j.vacancy_id
      LEFT JOIN employers e ON j.employer_id = e.employer_id
      ORDER BY r.created_at DESC, r.referral_id DESC
      LIMIT 10
    `);

    // ==================================================
    // EMPLOYER RESPONSE MONITORING
    // ==================================================
    const employerResponseResult = await safeQuery(`
      SELECT
        COUNT(*) AS totalReferrals,
        SUM(CASE WHEN interview_date IS NOT NULL THEN 1 ELSE 0 END) AS interviewed,
        SUM(CASE WHEN LOWER(TRIM(COALESCE(status, ''))) = 'hired' THEN 1 ELSE 0 END) AS hired,
        SUM(CASE WHEN LOWER(TRIM(COALESCE(status, ''))) = 'rejected' THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN LOWER(TRIM(COALESCE(status, ''))) = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN LOWER(TRIM(COALESCE(status, ''))) = 'no response' THEN 1 ELSE 0 END) AS awaitingEmployerResponse
      FROM referrals
    `);

    const employerResponseRow = employerResponseResult[0] || {};
    const employerResponse = {
      totalReferrals: Number(employerResponseRow.totalReferrals) || 0,
      interviewed: Number(employerResponseRow.interviewed) || 0,
      hired: Number(employerResponseRow.hired) || 0,
      rejected: Number(employerResponseRow.rejected) || 0,
      pending: Number(employerResponseRow.pending) || 0,
      awaitingEmployerResponse: Number(employerResponseRow.awaitingEmployerResponse) || 0,
    };

    // ==================================================
    // ALERTS
    // ==================================================
    const [followUpsResult, expiringVacanciesResult, incompleteApplicantsResult, interviewsThisWeekResult, hiredThisMonthResult] =
      await Promise.all([
        safeQuery(`
          SELECT COUNT(*) AS total
          FROM referrals
          WHERE next_follow_up IS NOT NULL
            AND next_follow_up <= CURDATE()
            AND status NOT IN ('Hired','Rejected','Failed','Cancelled','Expired')
        `),
        safeQuery(`
          SELECT COUNT(*) AS total
          FROM job_vacancies
          WHERE LOWER(TRIM(COALESCE(status, ''))) = 'active'
            AND deadline IS NOT NULL
            AND deadline >= CURDATE()
            AND deadline <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        `),
        safeQuery(`
          SELECT COUNT(*) AS total
          FROM applicants
          WHERE profile_completion_score < 100
             OR resume_uploaded = 0
             OR valid_id_uploaded = 0
             OR diploma_tor_uploaded = 0
        `),
        safeQuery(`
          SELECT COUNT(*) AS total
          FROM referrals
          WHERE interview_date IS NOT NULL
            AND interview_date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
            AND interview_date < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
        `),
        safeQuery(`
          SELECT COUNT(*) AS total
          FROM referrals
          WHERE LOWER(TRIM(COALESCE(status, ''))) = 'hired'
            AND (
              date_referred >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
              OR created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            )
        `),
      ]);

    const responseData = {
      success: true,
      role,
      applicants: Number(applicantsResult[0]?.total) || 0,
      employers: Number(employersResult[0]?.total) || 0,
      vacancies: Number(vacanciesResult[0]?.total) || 0,
      activeVacancies: Number(activeVacanciesResult[0]?.total) || 0,
      referrals: Number(referralsResult[0]?.total) || 0,
      approvalCounts: {
        applicants: applicantsApproval,
        employers: employersApproval,
        vacancies: vacanciesApproval,
        referrals: referralsApproval,
      },
      pendingApprovals,
      approvalSummary,
      pendingApprovalRecords,
      employerResponse,
      status: Array.isArray(statusResult) ? statusResult : [],
      recentReferrals: Array.isArray(recentReferralsResult) ? recentReferralsResult : [],
      alerts: {
        followUps: Number(followUpsResult[0]?.total) || 0,
        expiringVacancies: Number(expiringVacanciesResult[0]?.total) || 0,
        incompleteApplicants: Number(incompleteApplicantsResult[0]?.total) || 0,
        interviewsThisWeek: Number(interviewsThisWeekResult[0]?.total) || 0,
        hiredThisMonth: Number(hiredThisMonthResult[0]?.total) || 0,
      },
    };

    console.log("DASHBOARD ROLE:", role);
    console.log("DASHBOARD APPROVAL SUMMARY:", approvalSummary);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data.",
      error: error.message,
    });
  }
};

module.exports = { getDashboard };
