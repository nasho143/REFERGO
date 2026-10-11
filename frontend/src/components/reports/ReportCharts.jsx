import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

function formatMonth(month) {
  if (!month) return "";

  const [year, monthNumber] = String(month).split("-");

  if (!year || !monthNumber) {
    return month;
  }

  const date = new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  );

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-800">
          {title}
        </h2>
      </div>

      <div className="h-[320px] w-full">
        {children}
      </div>
    </div>
  );
}

export default function ReportCharts({
  status = [],
  monthlyData = [],
  topPositions = [],
  topEmployers = [],
  interviewed = 0,
  hired = 0,
  rejected = 0,
  pending = 0,
  placementRate = 0,
}) {
  /* ============================================================
     MONTHLY REFERRAL DATA
     ============================================================ */

  const monthlyChartData = Array.isArray(monthlyData)
    ? monthlyData.map((item) => ({
        month: item.month,

        monthLabel: formatMonth(item.month),

        total_referred:
          Number(item.total_referred) || 0,

        interviewed:
          Number(item.interviewed) || 0,

        hired:
          Number(item.hired) || 0,

        rejected:
          Number(item.rejected) || 0,

        pending:
          Number(item.pending) || 0,
      }))
    : [];

  console.log(
    "MONTHLY DATA RECEIVED:",
    monthlyData
  );

  console.log(
    "MONTHLY CHART DATA:",
    monthlyChartData
  );

  /* ============================================================
     REFERRAL STATUS DATA
     ============================================================ */

  const statusChartData = Array.isArray(status)
    ? status.map((item) => ({
        status: item.status || "Unknown",

        total:
          Number(item.total) || 0,
      }))
    : [];

  /* ============================================================
     TOP POSITIONS
     ============================================================ */

  const positionChartData = Array.isArray(topPositions)
    ? topPositions.map((item) => ({
        position_title:
          item.position_title || "Unknown",

        total_referrals:
          Number(item.total_referrals) || 0,

        hired:
          Number(item.hired) || 0,
      }))
    : [];

  /* ============================================================
     TOP EMPLOYERS
     ============================================================ */

  const employerChartData = Array.isArray(topEmployers)
    ? topEmployers.map((item) => ({
        company_name:
          item.company_name || "Unknown",

        total_referrals:
          Number(item.total_referrals) || 0,

        hired:
          Number(item.hired) || 0,
      }))
    : [];

  /* ============================================================
     OUTCOME DATA
     ============================================================ */

  const outcomeData = [
    {
      name: "Interviewed",
      value: Number(interviewed) || 0,
      color: "#3a4789",
    },
    {
      name: "Hired",
      value: Number(hired) || 0,
      color: "#1e6b3c",
    },
    {
      name: "Rejected",
      value: Number(rejected) || 0,
      color: "#c8142f",
    },
    {
      name: "Pending",
      value: Number(pending) || 0,
      color: "#e3c400",
    },
  ];

  /* ============================================================
     EMPTY CHART
     ============================================================ */

  const EmptyChart = () => (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-500">
          No data available
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Data will appear here once records are available.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* ========================================================
          MONTHLY REFERRAL TRENDS
          ======================================================== */}

      <ChartCard title="Monthly Referral Trends">
        {monthlyChartData.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={monthlyChartData}
              margin={{
                top: 20,
                right: 20,
                left: 0,
                bottom: 10,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#d5d8e2"
              />

              <XAxis
                dataKey="monthLabel"
                tick={{
                  fontSize: 12,
                  fill: "#5c6280",
                }}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 12,
                  fill: "#5c6280",
                }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #d5d8e2",
                  boxShadow:
                    "none",
                }}

                labelStyle={{
                  fontWeight: 700,
                  color: "#2f3450",
                }}

                formatter={(value, name) => [
                  value,
                  name,
                ]}
              />

              <Legend />

              {/* =================================================
                  REFERRED
                  BLUE
                  ================================================= */}

              <Line
                type="monotone"
                dataKey="total_referred"
                name="Referred"
                stroke="#202860"
                strokeWidth={3}
                dot={{
                  r: 5,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                }}
              />

              {/* =================================================
                  INTERVIEWED
                  PURPLE
                  ================================================= */}

              <Line
                type="monotone"
                dataKey="interviewed"
                name="Interviewed"
                stroke="#3a4789"
                strokeWidth={3}
                dot={{
                  r: 5,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                }}
              />

              {/* =================================================
                  HIRED
                  GREEN
                  SAME 3PX
                  ================================================= */}

              <Line
                type="monotone"
                dataKey="hired"
                name="Hired"
                stroke="#1e6b3c"
                strokeWidth={3}
                dot={{
                  r: 5,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                }}
                connectNulls
              />

              {/* =================================================
                  REJECTED
                  RED
                  ================================================= */}

              <Line
                type="monotone"
                dataKey="rejected"
                name="Rejected"
                stroke="#c8142f"
                strokeWidth={3}
                dot={{
                  r: 5,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                }}
              />

              {/* =================================================
                  PENDING
                  ORANGE
                  ================================================= */}

              <Line
                type="monotone"
                dataKey="pending"
                name="Pending"
                stroke="#e3c400"
                strokeWidth={3}
                dot={{
                  r: 5,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 8,
                }}
              />

            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* ========================================================
          REFERRAL STATUS + OUTCOME
          ======================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* ======================================================
            REFERRAL STATUS
            ====================================================== */}

        <ChartCard title="Referral Status">
          {statusChartData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={statusChartData}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#d5d8e2"
                />

                <XAxis
                  dataKey="status"
                  tick={{
                    fontSize: 11,
                    fill: "#5c6280",
                  }}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                    fill: "#5c6280",
                  }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #d5d8e2",
                  }}
                />

                <Bar
                  dataKey="total"
                  name="Referrals"
                  fill="#202860"
                  radius={[
                    6,
                    6,
                    0,
                    0,
                  ]}
                />

              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* ======================================================
            REFERRAL OUTCOME SUMMARY
            ====================================================== */}

        <ChartCard title="Referral Outcome Summary">
          {outcomeData.every(
            (item) => item.value === 0
          ) ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>

                <Pie
                  data={outcomeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={45}
                  paddingAngle={3}
                  label
                >
                  {outcomeData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    )
                  )}
                </Pie>

                <Tooltip />

                <Legend />

              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>

      {/* ========================================================
          TOP POSITIONS + TOP EMPLOYERS
          ======================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* ======================================================
            TOP POSITIONS
            ====================================================== */}

        <ChartCard title="Top Positions by Referrals">
          {positionChartData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={positionChartData}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 20,
                  left: 20,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#d5d8e2"
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                    fill: "#5c6280",
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="position_title"
                  width={100}
                  tick={{
                    fontSize: 11,
                    fill: "#5c6280",
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="total_referrals"
                  name="Referrals"
                  fill="#3a4789"
                  radius={[
                    0,
                    6,
                    6,
                    0,
                  ]}
                />

              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* ======================================================
            TOP EMPLOYERS
            ====================================================== */}

        <ChartCard title="Top Employers by Referrals">
          {employerChartData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={employerChartData}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 20,
                  left: 20,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#d5d8e2"
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                    fill: "#5c6280",
                  }}
                />

                <YAxis
                  type="category"
                  dataKey="company_name"
                  width={110}
                  tick={{
                    fontSize: 11,
                    fill: "#5c6280",
                  }}
                />

                <Tooltip />

                <Bar
                  dataKey="total_referrals"
                  name="Referrals"
                  fill="#1e6b3c"
                  radius={[
                    0,
                    6,
                    6,
                    0,
                  ]}
                />

              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>

      {/* ========================================================
          EMPLOYMENT PERFORMANCE
          ======================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-800">
            Employment Performance
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Summary of current referral and placement outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          {/* INTERVIEWED */}

          <div className="rounded-xl bg-purple-50 p-4">
            <p className="text-sm font-medium text-purple-600">
              Interviewed
            </p>

            <p className="mt-2 text-2xl font-bold text-purple-700">
              {Number(interviewed) || 0}
            </p>
          </div>

          {/* HIRED */}

          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-sm font-medium text-green-600">
              Hired
            </p>

            <p className="mt-2 text-2xl font-bold text-green-700">
              {Number(hired) || 0}
            </p>
          </div>

          {/* REJECTED */}

          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-sm font-medium text-red-600">
              Rejected
            </p>

            <p className="mt-2 text-2xl font-bold text-red-700">
              {Number(rejected) || 0}
            </p>
          </div>

          {/* PENDING */}

          <div className="rounded-xl bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-600">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-700">
              {Number(pending) || 0}
            </p>
          </div>

          {/* PLACEMENT RATE */}

          <div className="rounded-xl bg-blue-50 p-4">
            <p className="text-sm font-medium text-[#202860]">
              Placement Rate
            </p>

            <p className="mt-2 text-2xl font-bold text-[#202860]">
              {Number(placementRate) || 0}%
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}