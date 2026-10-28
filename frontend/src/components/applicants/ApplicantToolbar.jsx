import ModuleToolbar from "../common/ModuleToolbar";

export default function ApplicantToolbar({
  search,
  setSearch,
  period,
  setPeriod,
  onAdd,
  totalApplicants = 0,
  children,
}) {
  return (
    <ModuleToolbar
      search={search}
      setSearch={setSearch}
      searchPlaceholder="Search applicant..."
      period={period}
      setPeriod={setPeriod}
      totalLabel="Total Applicants"
      total={totalApplicants}
      addLabel="Add Applicant"
      onAdd={onAdd}
    >
      {children}
    </ModuleToolbar>
  );
}
