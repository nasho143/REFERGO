import { FaCheck, FaTimes } from "react-icons/fa";
import Button from "./Button";

export default function ApprovalActions({
  approvalStatus,
  onApprove,
  onReject,
}) {
  const status = String(approvalStatus || "")
    .trim()
    .toLowerCase();

  // Approval controls are only available for records that are
  // explicitly pending. Missing/unknown status is intentionally
  // hidden so the UI cannot offer an action the backend will reject.
  if (status !== "pending") return null;

  if (!onApprove && !onReject) return null;

  return (
    <div className="flex items-center gap-1.5">
      {onApprove && (
        <Button
          variant="success"
          size="sm"
          className="!h-9 !w-9 !p-0"
          icon={<FaCheck />}
          onClick={onApprove}
          title="Approve"
          aria-label="Approve"
        />
      )}

      {onReject && (
        <Button
          variant="danger"
          size="sm"
          className="!h-9 !w-9 !p-0"
          icon={<FaTimes />}
          onClick={onReject}
          title="Reject"
          aria-label="Reject"
        />
      )}
    </div>
  );
}
