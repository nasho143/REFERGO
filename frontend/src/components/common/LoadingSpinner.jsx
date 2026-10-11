export default function LoadingSpinner({
  message = "Loading...",
  fullScreen = false,
}) {
  const content = (
    <div
      role="status"
      className="flex items-center justify-center gap-3 py-12 text-slate-700"
    >
      <span
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-[3px] border-slate-300 border-t-blue-600"
      />
      <span className="font-semibold">{message}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
        {content}
      </div>
    );
  }

  return content;
}
