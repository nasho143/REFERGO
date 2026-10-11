import StatStrip from "../common/StatStrip";

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
    <StatStrip
      items={[
        { label: "Total Users", value: totalUsers },
        { label: "Active Users", value: activeUsers },
        { label: "Inactive Users", value: inactiveUsers },
        { label: "Department Heads", value: departmentHeads },
        { label: "PESO Staff", value: pesoStaff },
      ]}
    />
  );
}
