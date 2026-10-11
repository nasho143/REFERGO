import StatStrip from "../common/StatStrip";

export default function ApprovalOverview({ summary = {}, pendingTotal = 0 }) {
  const note =
    pendingTotal > 0
      ? `${pendingTotal} record${pendingTotal === 1 ? "" : "s"} require your attention.`
      : "There are no records waiting for your approval.";

  return (
    <StatStrip
      title="Approval overview"
      note={note}
      items={[
        { label: "Pending", value: summary.pending },
        { label: "Approved", value: summary.approved },
        { label: "Rejected", value: summary.rejected },
      ]}
    />
  );
}
