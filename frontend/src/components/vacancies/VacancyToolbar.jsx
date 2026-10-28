import ModuleToolbar from "../common/ModuleToolbar";

export default function VacancyToolbar({
  search,
  setSearch,
  period,
  setPeriod,
  onAdd,
  totalVacancies = 0,
}) {
  return (
    <ModuleToolbar
      search={search}
      setSearch={setSearch}
      searchPlaceholder="Search vacancy..."
      period={period}
      setPeriod={setPeriod}
      totalLabel="Total Vacancies"
      total={totalVacancies}
      addLabel="Add Vacancy"
      onAdd={onAdd}
    />
  );
}
