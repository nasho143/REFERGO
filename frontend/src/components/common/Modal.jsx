import { useEffect, useId } from "react";
import { FaTimes } from "react-icons/fa";

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "lg",
}) {
  const titleId = useId();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60"
      onClick={onClose}
    >
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(e) => e.stopPropagation()}
          className={`w-full ${sizes[size]} max-h-[92vh] overflow-hidden border border-slate-500 bg-white shadow-2xl`}
        >
          {/* Title bar */}
          <div className="flex items-start justify-between gap-4 border-b-4 border-red-500 bg-blue-600 px-5 py-3.5 text-white">
            <div>
              <h2
                id={titleId}
                className="!font-serif !text-xl !font-bold !text-white"
              >
                {title}
              </h2>

              {subtitle && (
                <p className="mt-0.5 text-sm text-blue-100">{subtitle}</p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="mt-0.5 flex items-center gap-1.5 border border-white/50 px-2.5 py-1 text-[13px] font-semibold text-white hover:bg-blue-800"
            >
              <FaTimes aria-hidden="true" />
              Close
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[72vh] overflow-y-auto p-5 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
