import ModuleToolbar from "../common/ModuleToolbar";

export default function ActivityLogToolbar({
  search,
  setSearch,
  period,
  setPeriod,
  totalActivities = 0,
}) {
  return (
    <ModuleToolbar
      search={search}
      setSearch={setSearch}
      searchPlaceholder="Search user, module, or activity..."
      period={period}
      setPeriod={setPeriod}
      totalLabel="Total Activities"
      total={totalActivities}
    />
  );
}
