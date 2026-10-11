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
  ...rest
}) {
  const variants = {
    primary: "border-blue-600 bg-blue-600 text-white hover:bg-blue-800",
    success: "border-green-600 bg-green-600 text-white hover:bg-green-800",
    warning: "border-amber-600 bg-amber-400 text-blue-900 hover:bg-amber-200",
    danger: "border-red-600 bg-red-600 text-white hover:bg-red-800",
    secondary:
      "border-slate-400 bg-white text-slate-800 hover:bg-slate-100",
    outline: "border-blue-600 bg-white text-blue-600 hover:bg-blue-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-md border font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...rest}
    >
      {loading ? <FaSpinner className="animate-spin" aria-hidden="true" /> : icon}

      {children && <span>{children}</span>}
    </button>
  );
}
