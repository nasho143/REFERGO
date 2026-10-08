import {
  FaUsers,
  FaBuilding,
  FaBriefcase,
  FaHandshake,
} from "react-icons/fa";

function Card({
  title,
  value,
  icon,
  iconColor,
  iconBackground,
  suffix = "",
}) {
  const numericValue = Number(value) || 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            {numericValue}

            {suffix && (
              <span className="ml-1 text-xl font-bold text-slate-700">
                {suffix}
              </span>
            )}
          </h2>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBackground} ${iconColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function ReportCards({ data = {} }) {
  return (
    <div className="space-y-5">
      {/* =====================================================
          GENERAL SUMMARY
      ====================================================== */}

      <section>
        <div className="mb-3">
          <h2 className="text-base font-bold text-slate-800">
            General Summary
          </h2>

          <p className="mt-0.5 text-sm text-slate-500">
            Current recruitment records and available opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card
            title="Registered Applicants"
            value={data.applicants}
            icon={<FaUsers />}
            iconColor="text-blue-600"
            iconBackground="bg-blue-50"
          />

          <Card
            title="Registered Employers"
            value={data.employers}
            icon={<FaBuilding />}
            iconColor="text-green-600"
            iconBackground="bg-green-50"
          />

          <Card
            title="Active Vacancies"
            value={data.activeVacancies}
            icon={<FaBriefcase />}
            iconColor="text-amber-600"
            iconBackground="bg-amber-50"
          />

          <Card
            title="Total Referrals"
            value={data.referrals}
            icon={<FaHandshake />}
            iconColor="text-purple-600"
            iconBackground="bg-purple-50"
          />
        </div>
      </section>
    </div>
  );
}