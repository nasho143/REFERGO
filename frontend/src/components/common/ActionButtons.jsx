import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import Button from "./Button";

export default function ActionButtons({
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex items-center gap-2.5">
      {/* VIEW */}
      {onView && (
        <Button
          variant="outline"
          size="sm"
          className="!h-9 !w-9 !p-0"
          icon={<FaEye />}
          onClick={onView}
          title="View"
          aria-label="View"
        />
      )}

      {/* EDIT */}
      {onEdit && (
        <Button
          variant="warning"
          size="sm"
          className="!h-9 !w-9 !p-0"
          icon={<FaEdit />}
          onClick={onEdit}
          title="Edit"
          aria-label="Edit"
        />
      )}

      {/* DELETE */}
      {onDelete && (
        <Button
          variant="danger"
          size="sm"
          className="!h-9 !w-9 !p-0"
          icon={<FaTrash />}
          onClick={onDelete}
          title="Delete"
          aria-label="Delete"
        />
      )}
    </div>
  );
}