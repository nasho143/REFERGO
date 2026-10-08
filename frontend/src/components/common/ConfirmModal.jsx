import Modal from "./Modal";
import Button from "./Button";
import {
  FaTrashAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  variant = "danger",
}) {
  const colors = {
    danger: {
      bg: "bg-red-100",
      text: "text-red-600",
      icon: <FaTrashAlt />,
    },
    warning: {
      bg: "bg-amber-100",
      text: "text-amber-600",
      icon: <FaExclamationTriangle />,
    },
    primary: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      icon: <FaExclamationTriangle />,
    },
  };

  const current = colors[variant] || colors.danger;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="text-center">

        {/* Icon */}
        <div
          className={`
            mx-auto
            mb-6
            flex
            h-20
            w-20
            items-center
            justify-center
            rounded-full
            ${current.bg}
          `}
        >
          <div className={`text-4xl ${current.text}`}>
            {current.icon}
          </div>
        </div>

        {/* Message */}
        <p className="text-slate-600 leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">

          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant={variant}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>

        </div>

      </div>
    </Modal>
  );
}