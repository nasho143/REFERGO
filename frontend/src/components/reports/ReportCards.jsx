import StatStrip from "../common/StatStrip";

export default function ReportCards({ data = {} }) {
  return (
    <StatStrip
      title="General summary"
      note="Current recruitment records and available opportunities."
      items={[
        { label: "Registered Applicants", value: data.applicants },
        { label: "Registered Employers", value: data.employers },
        { label: "Active Vacancies", value: data.activeVacancies },
        { label: "Total Referrals", value: data.referrals },
      ]}
    />
  );
}
