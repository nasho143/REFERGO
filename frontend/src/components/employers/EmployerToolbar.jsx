import ModuleToolbar from "../common/ModuleToolbar";

export default function EmployerToolbar({
  search,
  setSearch,
  period,
  setPeriod,
  onAdd,
  totalEmployers = 0,
}) {
  return (
    <ModuleToolbar
      search={search}
      setSearch={setSearch}
      searchPlaceholder="Search employer..."
      period={period}
      setPeriod={setPeriod}
      totalLabel="Total Employers"
      total={totalEmployers}
      addLabel="Add Employer"
      onAdd={onAdd}
    />
  );
}
