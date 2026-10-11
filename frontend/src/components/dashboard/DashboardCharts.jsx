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
  Pending: "#e3c400",
  "For Interview": "#3a4789",
  "Interview Scheduled": "#3a4789",
  Hired: "#1e6b3c",
  Rejected: "#c8142f",
  Failed: "#c8142f",
  "No Response": "#5c6280",
  Expired: "#5c6280",
  Cancelled: "#5c6280",
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
  return STATUS_COLORS[status] || "#202860";
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
                  border: "1px solid #d5d8e2",
                  boxShadow: "none",
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
                  border: "1px solid #d5d8e2",
                  boxShadow: "none",
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