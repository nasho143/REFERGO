import EmptyState from "./EmptyState";
import { SkeletonTable } from "./Skeleton";

export default function DataTable({
  columns = [],
  columnWidths = [],
  children,
  loading = false,
  isEmpty = false,
  emptyTitle = "No records found",
  emptyDescription = "There is no data to display.",
  emptyButtonText,
  onEmptyButtonClick,
}) {
  if (loading) {
    return <SkeletonTable columns={columns.length || 6} rows={7} />;
  }

  return (
    <div className="overflow-x-auto border border-slate-400 bg-white">
      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {columns.map((column, index) => {
              const isLastColumn = index === columns.length - 1;

              return (
                <th
                  key={column}
                  style={{
                    width: columnWidths[index] || "auto",
                  }}
                  className={`whitespace-nowrap py-3 text-left text-[13px] font-bold ${isLastColumn ? "pl-2 pr-3" : "px-4"}`}
                >
                  {column}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  buttonText={emptyButtonText}
                  onButtonClick={onEmptyButtonClick}
                />
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}