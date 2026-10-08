import EmptyState from "./EmptyState";
import LoadingSpinner from "./LoadingSpinner";

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
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full table-fixed border-collapse">
        <thead className="bg-slate-100">
          <tr>
            {columns.map((column, index) => {
              const isLastColumn = index === columns.length - 1;

              return (
                <th
                  key={column}
                  style={{
                    width: columnWidths[index] || "auto",
                  }}
                  className={`
                    whitespace-nowrap
                    border-b
                    border-slate-200
                    py-4
                    text-left
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-slate-700
                    ${
                      isLastColumn
                        ? "pl-2 pr-3"
                        : "px-5"
                    }
                  `}
                >
                  {column}
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length} className="p-12">
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