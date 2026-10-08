import { FaInbox } from "react-icons/fa";
import Button from "./Button";

export default function EmptyState({
  title = "No Records Found",
  description = "There are currently no records to display.",
  buttonText,
  onButtonClick,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">

      {/* Icon */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 shadow-sm">
        <FaInbox className="text-5xl text-slate-400" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-slate-800">
        {title}
      </h2>

      {/* Description */}
      <p className="mt-3 max-w-md text-slate-500 leading-relaxed">
        {description}
      </p>

      {/* Optional Button */}
      {buttonText && (
        <Button
          className="mt-8"
          onClick={onButtonClick}
        >
          {buttonText}
        </Button>
      )}

    </div>
  );
}