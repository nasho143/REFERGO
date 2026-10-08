import { FaSpinner } from "react-icons/fa";

export default function LoadingSpinner({
  message = "Loading...",
  fullScreen = false,
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-5 py-12">

      {/* Spinner */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 shadow-sm">

        <FaSpinner className="animate-spin text-4xl text-blue-600" />

      </div>

      {/* Message */}
      <div className="text-center">

        <p className="text-lg font-semibold text-slate-700">
          {message}
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Please wait a moment...
        </p>

      </div>

    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}