const db = require("../config/db");

// ======================================================
// NOTIFICATIONS
// Built from live data, so there is no extra table to maintain.
// Every user sees operational reminders. The Department Head also
// sees records waiting for approval and password reset requests.
// ======================================================

const safeCount = async (sql, params = []) => {
  try {
    const [rows] = await db.query(sql, params);
    return Number(rows?.[0]?.total) || 0;
  } catch (error) {
    console.error("NOTIFICATION QUERY ERROR:", error.message);
    return 0;
  }
};

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

exports.getNotifications = async (req, res) => {
  try {
    const role = String(req.user?.role || "").trim().toLowerCase();
    const isDepartmentHead = role === "department_head";

    const [
      followUps,
      interviewsToday,
      interviewsThisWeek,
      expiringVacancies,
      incompleteApplicants,
    ] = await Promise.all([
      safeCount(`
        SELECT COUNT(*) AS total FROM referrals
        WHERE next_follow_up IS NOT NULL
          AND next_follow_up <= CURDATE()
          AND status NOT IN ('Hired','Rejected','Failed','Cancelled','Expired')
      `),
      safeCount(`
        SELECT COUNT(*) AS total FROM referrals
        WHERE interview_date IS NOT NULL AND DATE(interview_date) = CURDATE()
      `),
      safeCount(`
        SELECT COUNT(*) AS total FROM referrals
        WHERE interview_date IS NOT NULL
          AND DATE(interview_date) >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
          AND DATE(interview_date) < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY)
      `),
      safeCount(`
        SELECT COUNT(*) AS total FROM job_vacancies
        WHERE LOWER(TRIM(COALESCE(status, ''))) <> 'closed'
          AND deadline IS NOT NULL
          AND deadline >= CURDATE()
          AND deadline <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
      `),
      safeCount(`
        SELECT COUNT(*) AS total FROM applicants
        WHERE COALESCE(profile_completion_score, 0) < 100
      `),
    ]);

    const items = [];

    if (isDepartmentHead) {
      const [pApplicants, pEmployers, pVacancies, pReferrals] =
        await Promise.all([
          safeCount(`SELECT COUNT(*) AS total FROM applicants WHERE LOWER(TRIM(COALESCE(approval_status,''))) = 'pending'`),
          safeCount(`SELECT COUNT(*) AS total FROM employers WHERE LOWER(TRIM(COALESCE(approval_status,''))) = 'pending'`),
          safeCount(`SELECT COUNT(*) AS total FROM job_vacancies WHERE LOWER(TRIM(COALESCE(approval_status,''))) = 'pending'`),
          safeCount(`SELECT COUNT(*) AS total FROM referrals WHERE LOWER(TRIM(COALESCE(approval_status,''))) = 'pending'`),
        ]);

      const approvals = [
        ["applicants", "applicant", "applicants", pApplicants, "/applicants?approval=Pending"],
        ["employers", "employer", "employers", pEmployers, "/employers?approval=Pending"],
        ["vacancies", "job vacancy", "job vacancies", pVacancies, "/vacancies?approval=Pending"],
        ["referrals", "referral", "referrals", pReferrals, "/referrals?approval=Pending"],
      ];

      approvals.forEach(([key, one, many, count, link]) => {
        if (count > 0) {
          items.push({
            id: `approval-${key}`,
            type: "approval",
            title: "Waiting for approval",
            message: `${plural(count, one, many)} to review.`,
            count,
            link,
          });
        }
      });
    }

    if (followUps > 0) {
      items.push({
        id: "follow-ups",
        type: "alert",
        title: "Follow-ups due",
        message: `${plural(followUps, "referral needs", "referrals need")} a follow-up with the employer.`,
        count: followUps,
        link: "/referrals?followup=due",
      });
    }

    if (interviewsToday > 0) {
      items.push({
        id: "interviews-today",
        type: "info",
        title: "Interviews today",
        message: `${plural(interviewsToday, "interview is", "interviews are")} scheduled for today.`,
        count: interviewsToday,
        link: "/referrals?interviews=today",
      });
    }

    if (interviewsThisWeek > 0) {
      items.push({
        id: "interviews-week",
        type: "info",
        title: "Interviews this week",
        message: `${plural(interviewsThisWeek, "interview", "interviews")} scheduled this week (Monday to Sunday).`,
        count: interviewsThisWeek,
        link: "/referrals?interviews=week",
      });
    }

    if (expiringVacancies > 0) {
      items.push({
        id: "expiring-vacancies",
        type: "alert",
        title: "Vacancies closing soon",
        message: `${plural(expiringVacancies, "vacancy closes", "vacancies close")} within 7 days.`,
        count: expiringVacancies,
        link: "/vacancies?vstatus=expiring",
      });
    }

    if (incompleteApplicants > 0) {
      items.push({
        id: "incomplete-applicants",
        type: "info",
        title: "Incomplete applicant profiles",
        message: `${plural(incompleteApplicants, "applicant has", "applicants have")} missing information or documents.`,
        count: incompleteApplicants,
        link: "/applicants?incomplete=1",
      });
    }

    return res.status(200).json({
      success: true,
      total: items.reduce((sum, item) => sum + item.count, 0),
      data: items,
    });
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load notifications.",
    });
  }
};
