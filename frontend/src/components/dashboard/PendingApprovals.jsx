import { FaCheckCircle, FaClock, FaUsers, FaBuilding, FaBriefcase, FaExchangeAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const items = [
  { key: "applicants", title: "Applicants", icon: FaUsers, path: "/applicants", tone: "blue" },
  { key: "employers", title: "Employers", icon: FaBuilding, path: "/employers", tone: "green" },
  { key: "vacancies", title: "Job Vacancies", icon: FaBriefcase, path: "/vacancies", tone: "amber" },
  { key: "referrals", title: "Referrals", icon: FaExchangeAlt, path: "/referrals", tone: "purple" },
];

const toneMap = {
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  green: "bg-green-50 text-green-700 border-green-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
};

export default function PendingApprovals({ data = {} }) {
  const navigate = useNavigate();
  const total = Number(data.total) || 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <FaClock />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Pending Approvals</h2>
          <p className="text-sm text-slate-500">Records currently waiting for your review.</p>
        </div>
        <div className="ml-auto hidden rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700 sm:block">
          {total} pending
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map(({ key, title, icon: Icon, path, tone }) => {
          const count = Number(data[key]) || 0;
          return (
            <div key={key} className={`rounded-2xl border bg-white p-5 shadow-sm ${toneMap[tone]}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Icon />
                </div>
                <span className="text-3xl font-extrabold">{count}</span>
              </div>
              <h3 className="mt-5 text-base font-bold text-slate-800">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {count === 0 ? "No records are waiting for approval." : `${count} record${count === 1 ? "" : "s"} waiting for review.`}
              </p>
              <button
                type="button"
                onClick={() => navigate(path)}
                className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                Review {title}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
