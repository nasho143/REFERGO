import ModuleToolbar from "../common/ModuleToolbar";

export default function UserToolbar({
  search,
  setSearch,
  period,
  setPeriod,
  totalUsers = 0,
  onAddUser,
}) {
  return (
    <ModuleToolbar
      search={search}
      setSearch={setSearch}
      searchPlaceholder="Search users..."
      period={period}
      setPeriod={setPeriod}
      totalLabel="Total Users"
      total={totalUsers}
      addLabel="Add User"
      onAdd={onAddUser}
    />
  );
}
