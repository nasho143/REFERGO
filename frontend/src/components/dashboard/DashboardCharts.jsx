import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const STATUS_COLORS = {
  Pending: "#f59e0b",
  "For Interview": "#9333ea",
  "Interview Scheduled": "#9333ea",
  Hired: "#16a34a",
  Rejected: "#dc2626",
  Failed: "#dc2626",
  "No Response": "#64748b",
  Expired: "#64748b",
  Cancelled: "#64748b",
};

function normalizeStatusData(status = []) {
  if (!Array.isArray(status)) {
    return [];
  }

  return status
    .map((item) => ({
      status: item?.status || "Unknown",
      total: Number(item?.total) || 0,
    }))
    .filter((item) => item.total > 0);
}

function getStatusColor(status) {
  return STATUS_COLORS[status] || "#2563eb";
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">
            {subtitle}
          </p>
        )}
      </div>

      <div className="h-72 w-full sm:h-80">
        {children}
      </div>
    </div>
  );
}

function EmptyChart({ message = "No data available." }) {
  return (
    <div className="flex h-full items-center justify-center rounded-xl bg-slate-50">
      <p className="px-4 text-center text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}

export default function DashboardCharts({ status = [] }) {
  const chartData = normalizeStatusData(status);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {/* Referral Status */}
      <ChartCard
        title="Referral Status"
        subtitle="Current distribution of employment referrals"
      >
        {chartData.length === 0 ? (
          <EmptyChart message="No referral status data available." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -15,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="status"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={chartData.length > 4 ? -20 : 0}
                textAnchor={chartData.length > 4 ? "end" : "middle"}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />

              <Bar
                dataKey="total"
                name="Referrals"
                radius={[8, 8, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`bar-${entry.status}-${index}`}
                    fill={getStatusColor(entry.status)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Referral Distribution */}
      <ChartCard
        title="Referral Distribution"
        subtitle="Percentage of referrals by current status"
      >
        {chartData.length === 0 ? (
          <EmptyChart message="No referral distribution data available." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="total"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius="70%"
                innerRadius="35%"
                paddingAngle={2}
                labelLine={false}
                label={({ status: label, percent }) =>
                  `${label} ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`pie-${entry.status}-${index}`}
                    fill={getStatusColor(entry.status)}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />

              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}