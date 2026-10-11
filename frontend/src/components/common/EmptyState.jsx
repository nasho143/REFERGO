import Button from "./Button";

export default function EmptyState({
  title = "No Records Found",
  description = "There are currently no records to display.",
  buttonText,
  onButtonClick,
}) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="font-serif text-xl font-bold text-blue-600">{title}</p>

      <p className="mx-auto mt-2 max-w-md text-slate-600">{description}</p>

      {buttonText && (
        <Button className="mt-6" onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );
}
