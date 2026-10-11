import { useNavigate } from "react-router-dom";
import RegisterTable from "../common/RegisterTable";
import Button from "../common/Button";

const items = [
  { key: "applicants", title: "Applicants", path: "/applicants" },
  { key: "employers", title: "Employers", path: "/employers" },
  { key: "vacancies", title: "Job Vacancies", path: "/vacancies" },
  { key: "referrals", title: "Referrals", path: "/referrals" },
];

export default function PendingApprovals({ data = {} }) {
  const navigate = useNavigate();
  const total = Number(data.total) || 0;

  const rows = items.map(({ key, title, path }) => {
    const count = Number(data[key]) || 0;

    return {
      title,
      count,
      urgent: true,
      description:
        count === 0
          ? "No records are waiting for approval."
          : `${count} record${count === 1 ? "" : "s"} waiting for review.`,
      action: (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(path)}
          aria-label={`Review ${title}`}
        >
          Review
        </Button>
      ),
    };
  });

  return (
    <RegisterTable
      title="Pending approvals"
      note={`Records currently waiting for your review: ${total} in total.`}
      rows={rows}
    />
  );
}
