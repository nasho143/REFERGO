// Summary of records: one ruled table instead of four decorated stat cards.
function Figure({ title, value }) {
  return (
    <div className="px-5 py-4">
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <p className="mt-1 font-serif text-[34px] font-bold leading-none text-blue-600">
        {Number(value) || 0}
      </p>
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
    <section
      aria-labelledby="summary-title"
      className="border border-slate-400 bg-white"
    >
      <h2
        id="summary-title"
        className="border-b border-slate-400 bg-slate-100 px-5 py-2.5 !text-base"
      >
        Summary of records
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4">
        <Figure title="Applicants" value={applicants} />
        <Figure title="Employers" value={employers} />
        <Figure title="Job Vacancies" value={vacancies} />
        <Figure title="Referrals" value={referrals} />
      </div>
    </section>
  );
}
