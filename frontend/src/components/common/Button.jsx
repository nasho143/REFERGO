import { FaSpinner } from "react-icons/fa";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  loading = false,
  disabled = false,
  icon = null,
  fullWidth = false,
  size = "md",
  className = "",
}) {
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300",

    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-300",

    warning:
      "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-300",

    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-300",

    secondary:
      "bg-slate-200 text-slate-700 hover:bg-slate-300 focus:ring-slate-300",

    outline:
      "border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 focus:ring-blue-200",
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        font-semibold
        transition-all
        duration-200
        shadow-sm
        hover:shadow-md
        active:scale-95
        focus:outline-none
        focus:ring-4
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${sizes[size]}
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <FaSpinner className="animate-spin text-base" />
      ) : (
        icon
      )}

      {children && <span>{children}</span>}
    </button>
  );
}