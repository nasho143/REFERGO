import MiniCharts from "../common/MiniCharts";
import { labelForKey } from "../../utils/chartData";

// Small graphs for every part of the report data.
export default function ReportCharts({ report }) {
  const other = Math.max(
    0,
    report.referrals - report.hired - report.rejected - report.pending
  );

  const charts = [
    {
      title: "Referrals per month",
      type: "line",
      data: report.monthlyData.map((m) => ({
        name: labelForKey(m.month),
        total: m.total_referred,
        hired: m.hired,
      })),
      series: [
        { key: "total", name: "Referred", color: "#202860" },
        { key: "hired", name: "Hired", color: "#1e6b3c" },
      ],
    },
    {
      title: "Referral status",
      type: "bar",
      data: report.status.map((s) => ({ name: s.status, value: Number(s.total) })),
    },
    {
      title: "Referral outcomes",
      type: "donut",
      data: [
        { name: "Hired", value: report.hired, color: "#1e6b3c" },
        { name: "Rejected", value: report.rejected, color: "#c8142f" },
        { name: "Pending", value: report.pending, color: "#c9a800" },
        { name: "Other", value: other, color: "#959fcb" },
      ],
    },
    {
      title: "Referral funnel",
      type: "bar",
      data: [
        { name: "Referred", value: report.referrals, color: "#202860" },
        { name: "Interviewed", value: report.interviewed, color: "#3a4789" },
        { name: "Hired", value: report.hired, color: "#1e6b3c" },
      ],
    },
    {
      title: "Top positions",
      type: "bar",
      data: report.topPositions.slice(0, 5).map((p) => ({
        name: p.position_title,
        value: p.total_referrals,
      })),
    },
    {
      title: "Top employers",
      type: "bar",
      data: report.topEmployers.slice(0, 5).map((p) => ({
        name: p.company_name,
        value: p.total_referrals,
      })),
    },
    {
      title: "Applicants by gender",
      type: "donut",
      data: report.gender,
    },
    {
      title: "Applicants by age group",
      type: "bar",
      data: report.ageGroups,
    },
  ];

  return <MiniCharts charts={charts} />;
}
