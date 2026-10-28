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


// ======================================================
// PERIOD FILTER (day / week / month)
// ======================================================
const pad2 = (n) => String(n).padStart(2, "0");
const fmtDate = (d) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

// Returns { start, end } as "YYYY-MM-DD" strings ([start, end) range) or null.
const getRange = (mode, value) => {
  const m = String(mode || "all").toLowerCase();
  const v = String(value || "").trim();

  if (m === "day" && /^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const [y, mo, d] = v.split("-").map(Number);
    return {
      start: fmtDate(new Date(y, mo - 1, d)),
      end: fmtDate(new Date(y, mo - 1, d + 1)),
    };
  }

  if (m === "month" && /^\d{4}-\d{2}$/.test(v)) {
    const [y, mo] = v.split("-").map(Number);
    return {
      start: fmtDate(new Date(y, mo - 1, 1)),
      end: fmtDate(new Date(y, mo, 1)),
    };
  }

  if (m === "week" && /^\d{4}-W\d{2}$/.test(v)) {
    const year = Number(v.substring(0, 4));
    const week = Number(v.substring(6, 8));
    const jan4 = new Date(year, 0, 4);
    const dow = jan4.getDay() || 7;
    const monday = new Date(year, 0, 4 - dow + 1 + (week - 1) * 7);
    return {
      start: fmtDate(monday),
      end: fmtDate(
        new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7)
      ),
    };
  }

  return null;
};

// Builds " AND col >= ? AND col < ?" plus its params for a date column.
const rangeFilter = (range, column) =>
  range
    ? {
        sql: ` AND ${column} >= ? AND ${column} < ?`,
        params: [range.start, range.end],
      }
    : { sql: "", params: [] };

const getDashboard = async (req, res) => {
  try {
    const role = String(req.user?.role || "peso_staff").trim().toLowerCase();
    const isDepartmentHead = role === "department_head";

    const range = getRange(req.query?.mode, req.query?.date);

    const fApplicants = rangeFilter(range, "created_at");
    const fEmployers = rangeFilter(range, "created_at");
    const fVacancies = rangeFilter(range, "created_at");
    const fReferrals = rangeFilter(range, "COALESCE(date_referred, DATE(created_at))");
    const fReferralsR = rangeFilter(range, "COALESCE(r.date_referred, DATE(r.created_at))");

    // ==================================================
    // MAIN STATISTICS (respect the selected period)
    // ==================================================
    const [
      applicantsResult,
      employersResult,
      vacanciesResult,
      referralsResult,
      activeVacanciesResult,
    ] = await Promise.all([
      safeQuery(`SELECT COUNT(*) AS total FROM applicants WHERE 1=1${fApplicants.sql}`, fApplicants.params),
      safeQuery(`SELECT COUNT(*) AS total FROM employers WHERE 1=1${fEmployers.sql}`, fEmployers.params),
      safeQuery(`SELECT COUNT(*) AS total FROM job_vacancies WHERE 1=1${fVacancies.sql}`, fVacancies.params),
      safeQuery(`SELECT COUNT(*) AS total FROM referrals WHERE 1=1${fReferrals.sql}`, fReferrals.params),
      safeQuery(`
        SELECT COUNT(*) AS total
        FROM job_vacancies
        WHERE LOWER(TRIM(COALESCE(status, ''))) <> 'closed'
          AND (deadline IS NULL OR deadline >= CURDATE())${fVacancies.sql}
      `, fVacancies.params),
    ]);

    // ==================================================
    // BREAKDOWNS FOR THE DASHBOARD GRAPHS
    // ==================================================
    const [
      genderRows,
      ageRows,
      readinessRows,
      vacancyStatusRows,
      employerStatusRows,
      trendRows,
    ] = await Promise.all([
      safeQuery(`
        SELECT COALESCE(gender, 'Not specified') AS label, COUNT(*) AS total
        FROM applicants
        WHERE 1=1${fApplicants.sql}
        GROUP BY COALESCE(gender, 'Not specified')
      `, fApplicants.params),
      safeQuery(`
        SELECT
          CASE
            WHEN birthdate IS NULL THEN 'Not specified'
            WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) <= 18 THEN '18 & below'
            WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) <= 24 THEN '19–24'
            WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) <= 34 THEN '25–34'
            WHEN TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) <= 44 THEN '35–44'
            ELSE '45 & above'
          END AS label,
          COUNT(*) AS total
        FROM applicants
        WHERE 1=1${fApplicants.sql}
        GROUP BY label
      `, fApplicants.params),
      safeQuery(`
        SELECT
          SUM(CASE WHEN job_readiness_score >= 80 THEN 1 ELSE 0 END) AS ready,
          SUM(CASE WHEN job_readiness_score < 80 OR job_readiness_score IS NULL THEN 1 ELSE 0 END) AS notReady
        FROM applicants
        WHERE 1=1${fApplicants.sql}
      `, fApplicants.params),
      safeQuery(`
        SELECT
          CASE
            WHEN LOWER(TRIM(COALESCE(status, ''))) = 'closed' THEN 'Closed'
            WHEN deadline IS NOT NULL AND deadline < CURDATE() THEN 'Expired'
            WHEN deadline IS NOT NULL AND deadline <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Expiring Soon'
            ELSE 'Active'
          END AS label,
          COUNT(*) AS total
        FROM job_vacancies
        WHERE 1=1${fVacancies.sql}
        GROUP BY label
      `, fVacancies.params),
      safeQuery(`
        SELECT COALESCE(NULLIF(TRIM(approval_status), ''), 'Pending') AS label, COUNT(*) AS total
        FROM employers
        WHERE 1=1${fEmployers.sql}
        GROUP BY COALESCE(NULLIF(TRIM(approval_status), ''), 'Pending')
      `, fEmployers.params),
      // Trend: daily inside a chosen day/week/month, monthly (last 6) otherwise.
      range
        ? safeQuery(`
            SELECT DATE_FORMAT(COALESCE(date_referred, DATE(created_at)), '%Y-%m-%d') AS label,
                   COUNT(*) AS total,
                   SUM(CASE WHEN LOWER(TRIM(COALESCE(status, ''))) = 'hired' THEN 1 ELSE 0 END) AS hired
            FROM referrals
            WHERE 1=1${fReferrals.sql}
            GROUP BY label
            ORDER BY label
          `, fReferrals.params)
        : safeQuery(`
            SELECT DATE_FORMAT(COALESCE(date_referred, DATE(created_at)), '%Y-%m') AS label,
                   COUNT(*) AS total,
                   SUM(CASE WHEN LOWER(TRIM(COALESCE(status, ''))) = 'hired' THEN 1 ELSE 0 END) AS hired
            FROM referrals
            WHERE COALESCE(date_referred, DATE(created_at)) >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 5 MONTH), '%Y-%m-01')
            GROUP BY label
            ORDER BY label
          `),
    ]);

    const toBreakdown = (rows) =>
      (Array.isArray(rows) ? rows : []).map((row) => ({
        label: row.label,
        total: Number(row.total) || 0,
      }));

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
      WHERE 1=1${fReferrals.sql}
      GROUP BY status
      ORDER BY total DESC
    `, fReferrals.params);

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
      WHERE 1=1${fReferralsR.sql}
      ORDER BY r.created_at DESC, r.referral_id DESC
      LIMIT 10
    `, fReferralsR.params);

    // ==================================================
    // EMPLOYER RESPONSE MONITORING
    // ==================================================
    const employerResponseResult = await safeQuery(`
      SELECT
        COUNT(*) AS totalReferrals,
        SUM(CASE WHEN interview_date IS NOT NULL THEN 1 ELSE 0 END) AS interviewed,
        SUM(CASE WHEN LOWER(TRIM(COALESCE(status, ''))) = 'hired' THEN 1 ELSE 0 END) AS hired,
        SUM(CASE WHEN LOWER(TRIM(COALESCE(status, ''))) IN ('rejected', 'failed') THEN 1 ELSE 0 END) AS rejected,
        SUM(CASE WHEN LOWER(TRIM(COALESCE(status, ''))) = 'pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN LOWER(TRIM(COALESCE(status, ''))) = 'no response' THEN 1 ELSE 0 END) AS awaitingEmployerResponse
      FROM referrals
      WHERE 1=1${fReferrals.sql}
    `, fReferrals.params);

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
          WHERE LOWER(TRIM(COALESCE(status, ''))) <> 'closed'
            AND deadline IS NOT NULL
            AND deadline >= CURDATE()
            AND deadline <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        `),
        safeQuery(`
          SELECT COUNT(*) AS total
          FROM applicants
          WHERE COALESCE(profile_completion_score, 0) < 100
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
            AND COALESCE(date_referred, DATE(created_at)) >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
            AND COALESCE(date_referred, DATE(created_at)) < DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
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
      period: range ? { mode: req.query.mode, date: req.query.date, ...range } : { mode: "all" },
      pendingApprovals,
      approvalSummary,
      pendingApprovalRecords,
      employerResponse,
      gender: toBreakdown(genderRows),
      ageGroups: toBreakdown(ageRows),
      readiness: {
        ready: Number(readinessRows[0]?.ready) || 0,
        notReady: Number(readinessRows[0]?.notReady) || 0,
      },
      vacancyStatus: toBreakdown(vacancyStatusRows),
      employerStatus: toBreakdown(employerStatusRows),
      referralTrend: (Array.isArray(trendRows) ? trendRows : []).map((row) => ({
        label: row.label,
        total: Number(row.total) || 0,
        hired: Number(row.hired) || 0,
      })),
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
