import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaUserTie,
  FaUserCog,
} from "react-icons/fa";

function SummaryCard({ title, value, icon, iconBg, iconColor }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-800">
            {value}
          </h3>
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

export default function UserSummaryCards({ users = [] }) {
  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "inactive"
  ).length;

  const departmentHeads = users.filter(
    (user) => user.role === "department_head"
  ).length;

  const pesoStaff = users.filter(
    (user) => user.role === "peso_staff"
  ).length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        title="Total Users"
        value={totalUsers}
        icon={<FaUsers />}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
      />

      <SummaryCard
        title="Active Users"
        value={activeUsers}
        icon={<FaUserCheck />}
        iconBg="bg-green-50"
        iconColor="text-green-600"
      />

      <SummaryCard
        title="Inactive Users"
        value={inactiveUsers}
        icon={<FaUserTimes />}
        iconBg="bg-red-50"
        iconColor="text-red-600"
      />

      <SummaryCard
        title="Department Heads"
        value={departmentHeads}
        icon={<FaUserTie />}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
      />

      <SummaryCard
        title="PESO Staff"
        value={pesoStaff}
        icon={<FaUserCog />}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
      />
    </div>
  );
}