import { Link } from "react-router-dom";
import { linkTo } from "../../utils/quickFilter";
import { todayValue } from "../../utils/period";

// Items that need action. Each tile is a shortcut to the records.
export default function DashboardAlerts({ alerts = {} }) {
  const items = [
    { title: "Follow-ups due", count: alerts.followUps, to: linkTo("/referrals", { followup: "due" }) },
    { title: "Vacancies expiring soon", count: alerts.expiringVacancies, to: linkTo("/vacancies", { vstatus: "expiring" }) },
    { title: "Incomplete applicants", count: alerts.incompleteApplicants, to: linkTo("/applicants", { incomplete: 1 }) },
    { title: "Interviews this week", count: alerts.interviewsThisWeek, to: linkTo("/referrals", { interviews: "week" }) },
    {
      title: "Hired this month",
      count: alerts.hiredThisMonth,
      to: linkTo("/referrals", { status: "Hired" }, { mode: "month", value: todayValue("month") }),
    },
  ];

  return (
    <section
      aria-labelledby="attention-title"
      className="border border-slate-300 bg-white"
    >
      <h2
        id="attention-title"
        className="border-b border-slate-300 bg-slate-50 px-4 py-2 !text-[15px]"
      >
        Needs attention
      </h2>

      <ul className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => {
          const count = Number(item.count) || 0;

          return (
            <li key={item.title} className="bg-white">
              <Link
                to={item.to}
                aria-label={`${item.title}: ${count}. Open records.`}
                className="flex h-full flex-col px-3 py-2.5 no-underline hover:bg-blue-50"
              >
                <span className="text-[12.5px] font-semibold text-slate-600">
                  {item.title}
                </span>
                <span className="mt-0.5 font-serif text-2xl font-bold text-blue-600">
                  {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
