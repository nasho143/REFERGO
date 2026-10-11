// Title bar plus ruled rows: item, details, figure (and an optional action).
// Reads like an entry in an office logbook instead of a grid of tiles.
export default function RegisterTable({ title, note, rows = [], action }) {
  return (
    <section className="border border-slate-400 bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-slate-400 bg-slate-100 px-5 py-2.5">
        <div>
          <h2 className="!text-base">{title}</h2>
          {note && <p className="text-[13px] text-slate-600">{note}</p>}
        </div>
        {action}
      </div>

      <table className="w-full !min-w-0">
        <thead className="sr-only">
          <tr>
            <th>Item</th>
            <th>Details</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.title} className="!bg-transparent hover:!bg-amber-50">
              <td className="md:w-[30%] px-5 py-3.5 align-top font-bold text-slate-900">
                {row.title}
              </td>
              <td className="hidden px-4 py-3.5 text-sm leading-6 text-slate-600 md:table-cell">
                {row.description}
              </td>
              <td
                className={`w-24 px-5 py-3.5 text-right align-top font-serif text-2xl font-bold leading-none ${
                  row.urgent && row.count > 0 ? "text-red-600" : "text-blue-600"
                }`}
              >
                {row.count}
              </td>
              {row.action && (
                <td className="w-px whitespace-nowrap px-4 py-2.5 align-middle">
                  {row.action}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
