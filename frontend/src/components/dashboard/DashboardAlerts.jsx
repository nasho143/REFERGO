import {
  FaBell,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaUserClock,
  FaUserCheck,
  FaBriefcase,
} from "react-icons/fa";

export default function DashboardAlerts({ alerts = {} }) {
  const items = [
    {
      title: "Follow-ups Due",
      count: Number(alerts.followUps) || 0,
      description:
        "These referrals require follow-up action. Review the referral records and update the latest follow-up information.",
      icon: <FaBell />,
      iconBg: "bg-red-50",
      iconColor: "text-red-600",
      numberColor: "text-red-700",
    },
    {
      title: "Vacancies Expiring Soon",
      count: Number(alerts.expiringVacancies) || 0,
      description:
        "These job vacancies are approaching their application deadline. Review the vacancies and coordinate with the employers if needed.",
      icon: <FaBriefcase />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      numberColor: "text-amber-700",
    },
    {
      title: "Incomplete Applicants",
      count: Number(alerts.incompleteApplicants) || 0,
      description:
        "These applicants have incomplete profiles or missing requirements. Review their records and update the missing information.",
      icon: <FaExclamationTriangle />,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      numberColor: "text-orange-700",
    },
    {
      title: "Interviews This Week",
      count: Number(alerts.interviewsThisWeek) || 0,
      description:
        "These referrals have interviews scheduled or recorded for this week. Review the referral records for the latest interview details.",
      icon: <FaCalendarAlt />,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      numberColor: "text-purple-700",
    },
    {
      title: "Hired This Month",
      count: Number(alerts.hiredThisMonth) || 0,
      description:
        "These applicants have been successfully hired this month. Review their referral records and employment outcomes.",
      icon: <FaUserCheck />,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      numberColor: "text-green-700",
    },
  ];

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FaUserClock className="text-lg" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Dashboard Alerts
          </h2>

          <p className="text-sm text-slate-500">
            Important items that may require your attention.
          </p>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            {/* Icon + Number */}
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}
              >
                {item.icon}
              </div>

              <span
                className={`text-4xl font-extrabold leading-none tracking-tight ${item.numberColor}`}
              >
                {item.count}
              </span>
            </div>

            {/* Title */}
            <h3 className="mt-5 text-base font-bold text-slate-800">
              {item.title}
            </h3>

            {/* Description */}
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-500">
              {item.count === 0
                ? `There are currently no ${item.title.toLowerCase()} requiring attention.`
                : item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}