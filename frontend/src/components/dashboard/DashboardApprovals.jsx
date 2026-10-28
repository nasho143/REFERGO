import { Link } from "react-router-dom";
import { linkTo } from "../../utils/quickFilter";

// Department Head only: what is waiting for review, with a shortcut to each module.
export default function DashboardApprovals({ pending = {}, summary = {} }) {
  const items = [
    { title: "Applicants", count: pending.applicants, to: linkTo("/applicants", { approval: "Pending" }) },
    { title: "Employers", count: pending.employers, to: linkTo("/employers", { approval: "Pending" }) },
    { title: "Job Vacancies", count: pending.vacancies, to: linkTo("/vacancies", { approval: "Pending" }) },
    { title: "Referrals", count: pending.referrals, to: linkTo("/referrals", { approval: "Pending" }) },
  ];

  return (
    <section
      aria-labelledby="approvals-title"
      className="border border-slate-300 bg-white"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-300 bg-slate-50 px-4 py-2">
        <h2 id="approvals-title" className="!text-[15px]">
          Waiting for your approval
        </h2>
        <p className="text-[12.5px] text-slate-600">
          Pending {summary.pending || 0} · Approved {summary.approved || 0} ·
          Rejected {summary.rejected || 0}
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-px bg-slate-200 lg:grid-cols-4">
        {items.map((item) => {
          const count = Number(item.count) || 0;

          return (
            <li key={item.title} className="bg-white">
              <Link
                to={item.to}
                aria-label={`${item.title} pending approval: ${count}. Review.`}
                className="flex items-center justify-between px-4 py-2.5 no-underline hover:bg-blue-50"
              >
                <span className="text-[13px] font-semibold text-slate-700">
                  {item.title}
                </span>
                <span className="font-serif text-2xl font-bold text-blue-600">
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
