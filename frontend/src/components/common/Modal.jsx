import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = "lg",
}) {
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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-screen items-center justify-center p-6">

        <div
          onClick={(e) => e.stopPropagation()}
          className={`
            w-full
            ${sizes[size]}
            max-h-[90vh]
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-2xl
            animate-fadeIn
          `}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b bg-blue-600 px-8 py-6 text-white">

            <div>

              <h2 className="text-3xl font-bold">
                {title}
              </h2>

              {subtitle && (
                <p className="mt-2 text-blue-100">
                  {subtitle}
                </p>
              )}

            </div>

            <button
              onClick={onClose}
              className="
                rounded-lg
                p-2
                transition
                hover:bg-blue-700
                active:scale-95
              "
            >
              <FaTimes size={18} />
            </button>

          </div>

          {/* Body */}
          <div className="max-h-[70vh] overflow-y-auto p-8">

            {children}

          </div>

        </div>

      </div>
    </div>
  );
}