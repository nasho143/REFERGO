import ModuleToolbar from "../common/ModuleToolbar";

export default function ReferralToolbar({
  search,
  setSearch,
  period,
  setPeriod,
  onAdd,
  totalReferrals = 0,
  children,
}) {
  return (
    <ModuleToolbar
      search={search}
      setSearch={setSearch}
      searchPlaceholder="Search referral..."
      period={period}
      setPeriod={setPeriod}
      totalLabel="Total Referrals"
      total={totalReferrals}
      addLabel="Add Referral"
      onAdd={onAdd}
    >
      {children}
    </ModuleToolbar>
  );
}
