import {
  FaUsers,
  FaBuilding,
  FaBriefcase,
  FaHandshake,
} from "react-icons/fa";

function Card({ title, value, icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* Text */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            {Number(value) || 0}
          </h2>
        </div>

        {/* Icon */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl text-white shadow-sm ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function DashboardCards({
  applicants = 0,
  employers = 0,
  vacancies = 0,
  referrals = 0,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card
        title="Applicants"
        value={applicants}
        icon={<FaUsers />}
        color="bg-blue-600"
      />

      <Card
        title="Employers"
        value={employers}
        icon={<FaBuilding />}
        color="bg-green-600"
      />

      <Card
        title="Job Vacancies"
        value={vacancies}
        icon={<FaBriefcase />}
        color="bg-amber-500"
      />

      <Card
        title="Referrals"
        value={referrals}
        icon={<FaHandshake />}
        color="bg-purple-600"
      />
    </div>
  );
}