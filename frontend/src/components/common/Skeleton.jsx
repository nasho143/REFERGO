// Placeholders shown while data loads. They have the same shape as the real
// content, so the page does not jump when the data arrives.

const WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-1/3", "w-3/5"];

export function Skeleton({ className = "", style }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} style={style} />;
}

function Status({ label }) {
  return (
    <span role="status" className="sr-only">
      {label}
    </span>
  );
}

// Rows for a <tbody>. Use in place of the single "Loading..." row.
export function SkeletonRows({ columns = 5, rows = 6 }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={r} aria-hidden="true">
      {Array.from({ length: columns }).map((__, c) => (
        <td key={c} className="px-4 py-4">
          <Skeleton className={`h-3.5 ${WIDTHS[(r + c) % WIDTHS.length]}`} />
        </td>
      ))}
    </tr>
  ));
}

// A whole table-shaped card (used where the table itself is replaced).
export function SkeletonTable({ columns = 5, rows = 6, label = "Loading..." }) {
  return (
    <div aria-busy="true" className="overflow-hidden border border-slate-400 bg-white">
      <Status label={label} />
      <div
        className="grid gap-4 border-b border-slate-300 bg-slate-100 px-4 py-3.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} className="h-3 w-2/3" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-4 border-b border-slate-200 px-4 py-4 last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((__, c) => (
            <Skeleton key={c} className={`h-3.5 ${WIDTHS[(r + c) % WIDTHS.length]}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Same layout as the real chart cards.
export function SkeletonCharts({ count = 3 }) {
  return (
    <div
      aria-busy="true"
      className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
    >
      <Status label="Loading graphs..." />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} aria-hidden="true" className="border border-slate-300 bg-white">
          <div className="border-b border-slate-300 bg-slate-50 px-3 py-2.5">
            <Skeleton className="h-3.5 w-1/3" />
          </div>
          <div className="flex h-[150px] items-end gap-3 p-4">
            {[55, 80, 40, 95, 65].map((h, b) => (
              <Skeleton key={b} className="flex-1" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonTiles({ count, cols }) {
  return (
    <div
      aria-hidden="true"
      className={`grid gap-px border border-slate-300 bg-slate-200 ${cols}`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2 bg-white px-4 py-3.5">
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-2.5 w-3/4" />
        </div>
      ))}
    </div>
  );
}

function SkeletonBar() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-wrap items-center gap-3 border border-slate-300 bg-white px-3 py-3"
    >
      <Skeleton className="h-10 min-w-[200px] flex-1" />
      <Skeleton className="h-10 w-28" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-36" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <Status label="Loading dashboard..." />
      <div
        aria-hidden="true"
        className="flex items-center justify-between border border-slate-300 bg-white px-4 py-3"
      >
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-64" />
      </div>
      <SkeletonTiles count={4} cols="grid-cols-2 lg:grid-cols-4" />
      <SkeletonTiles count={4} cols="grid-cols-2 lg:grid-cols-4" />
      <SkeletonTiles count={5} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
      <SkeletonTiles count={6} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" />
      <SkeletonCharts count={6} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SkeletonTable columns={4} rows={4} label="Loading recent referrals..." />
        <SkeletonTable columns={3} rows={4} label="Loading recent activity..." />
      </div>
    </div>
  );
}

export function ReportsSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <Status label="Loading reports..." />
      <SkeletonBar />
      <SkeletonTiles count={6} cols="grid-cols-2 lg:grid-cols-6" />
      <SkeletonTiles count={4} cols="grid-cols-2 lg:grid-cols-4" />
      <SkeletonCharts count={8} />
    </div>
  );
}

// Toolbar + graphs + table, for pages that load everything at once.
export function ModuleSkeleton({ columns = 6 }) {
  return (
    <div aria-busy="true" className="space-y-4">
      <Status label="Loading..." />
      <SkeletonBar />
      <SkeletonCharts count={3} />
      <SkeletonTable columns={columns} rows={7} />
    </div>
  );
}
