import {
  FaHistory,
  FaUsers,
  FaCubes,
  FaCalendarDay,
} from "react-icons/fa";

function SummaryCard({ title, value, icon, iconBg, iconColor }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <h2 className="mt-2 text-3xl font-bold text-slate-800">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function ActivityLogSummaryCards({ logs = [] }) {
  const today = new Date();

  const isToday = (dateValue) => {
    if (!dateValue) return false;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return false;

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const todayActivities = logs.filter((log) =>
    isToday(log.created_at || log.date_time || log.createdAt)
  ).length;

  const uniqueUsers = new Set(
    logs
      .map(
        (log) =>
          log.username ||
          log.user_name ||
          log.user_id ||
          log.userId ||
          null
      )
      .filter(Boolean)
  ).size;

  const uniqueModules = new Set(
    logs
      .map((log) => log.module || "System")
      .filter(Boolean)
  ).size;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total Activities"
        value={logs.length}
        icon={<FaHistory />}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
      />

      <SummaryCard
        title="Today's Activities"
        value={todayActivities}
        icon={<FaCalendarDay />}
        iconBg="bg-green-50"
        iconColor="text-green-600"
      />

      <SummaryCard
        title="Active Users"
        value={uniqueUsers}
        icon={<FaUsers />}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
      />

      <SummaryCard
        title="Modules Used"
        value={uniqueModules}
        icon={<FaCubes />}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
      />
    </div>
  );
}