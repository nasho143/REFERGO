import RegisterTable from "../common/RegisterTable";

export default function DashboardAlerts({ alerts = {} }) {
  const items = [
    {
      title: "Follow-ups due",
      count: Number(alerts.followUps) || 0,
      description:
        "Referrals that require follow-up action. Review the referral records and update the latest follow-up information.",
      urgent: true,
    },
    {
      title: "Vacancies expiring soon",
      count: Number(alerts.expiringVacancies) || 0,
      description:
        "Job vacancies approaching their application deadline. Review the vacancies and coordinate with the employers if needed.",
      urgent: true,
    },
    {
      title: "Incomplete applicants",
      count: Number(alerts.incompleteApplicants) || 0,
      description:
        "Applicants with incomplete profiles or missing requirements. Review their records and update the missing information.",
    },
    {
      title: "Interviews this week",
      count: Number(alerts.interviewsThisWeek) || 0,
      description:
        "Referrals with interviews scheduled or recorded for this week. Review the referral records for the latest interview details.",
    },
    {
      title: "Hired this month",
      count: Number(alerts.hiredThisMonth) || 0,
      description:
        "Applicants successfully hired this month. Review their referral records and employment outcomes.",
    },
  ];

  const rows = items.map((item) => ({
    ...item,
    description:
      item.count === 0
        ? `There are currently no ${item.title.toLowerCase()}.`
        : item.description,
  }));

  return <RegisterTable title="Items requiring attention" rows={rows} />;
}
