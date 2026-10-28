import StatStrip from "../common/StatStrip";

export default function ReportCards({ data = {} }) {
  return (
    <StatStrip
      items={[
        { label: "Applicants", value: data.applicants },
        { label: "Employers", value: data.employers },
        { label: "Active Vacancies", value: data.activeVacancies },
        { label: "Referrals", value: data.referrals },
        { label: "Hired", value: data.hired },
        { label: "Placement Rate", value: `${Number(data.placementRate || 0).toFixed(1)}%` },
      ]}
    />
  );
}
