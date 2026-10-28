import { useEffect, useMemo, useState } from "react";
import MiniCharts from "../components/common/MiniCharts";
import { countBy, countOverTime } from "../utils/chartData";
import { DEFAULT_PERIOD, filterByPeriod } from "../utils/period";

import { getActivityLogs } from "../services/activityLogApi";

import { ModuleSkeleton } from "../components/common/Skeleton";
import ActivityLogToolbar from "../components/activityLogs/ActivityLogToolbar";
import ActivityLogSummaryCards from "../components/activityLogs/ActivityLogSummaryCards";
import ActivityLogTable from "../components/activityLogs/ActivityLogTable";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ACTIVITY LOGS
  // =====================================================

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getActivityLogs();

        console.log(
          "ACTIVITY LOG RESPONSE:",
          response?.data
        );

        const responseData = response?.data;

        // -----------------------------------------------
        // SUPPORT EXISTING RESPONSE FORMATS
        // -----------------------------------------------

        if (Array.isArray(responseData)) {
          setLogs(responseData);
        } else if (
          Array.isArray(responseData?.data)
        ) {
          setLogs(responseData.data);
        } else if (
          Array.isArray(responseData?.logs)
        ) {
          setLogs(responseData.logs);
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error(
          "LOAD ACTIVITY LOGS ERROR:",
          err
        );

        console.error(
          "ACTIVITY LOG ERROR RESPONSE:",
          err?.response?.data
        );

        setError(
          err?.response?.data?.message ||
            "Failed to load activity logs."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // =====================================================
  // FILTER LOGS
  // =====================================================

  const periodLogs = useMemo(
    () => filterByPeriod(logs, period, "created_at", "date_time"),
    [logs, period]
  );

  const filteredLogs = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    // No search keyword
    if (!keyword) {
      return periodLogs;
    }

    return periodLogs.filter((log) => {
      const username =
        log.username ||
        log.user_name ||
        "";

      const module =
        log.module ||
        "";

      const activity =
        log.activity ||
        log.action ||
        "";

      const userId =
        log.user_id ||
        log.userId ||
        "";

      const date =
        log.created_at ||
        log.date_time ||
        log.createdAt ||
        "";

      return (
        String(username)
          .toLowerCase()
          .includes(keyword) ||

        String(module)
          .toLowerCase()
          .includes(keyword) ||

        String(activity)
          .toLowerCase()
          .includes(keyword) ||

        String(userId)
          .toLowerCase()
          .includes(keyword) ||

        String(date)
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [periodLogs, search]);

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return <ModuleSkeleton columns={5} />;
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="w-full space-y-8">
      {/* =================================================
          TOOLBAR
      ================================================= */}

      <ActivityLogToolbar
        search={search}
        setSearch={setSearch}
        period={period}
        setPeriod={setPeriod}
        totalActivities={filteredLogs.length}
      />

      <MiniCharts
        charts={[
          {
            title: "Activities by module",
            type: "bar",
            data: countBy(filteredLogs, (l) => l.module, {
              fallback: "System",
            }).slice(0, 6),
          },
          {
            title: "Most active users",
            type: "bar",
            data: countBy(
              filteredLogs,
              (l) => l.username || l.user_name,
              { fallback: "System" }
            ).slice(0, 5),
          },
          {
            title: "Activities over time",
            type: "line",
            data: countOverTime(
              filteredLogs,
              (l) => l.created_at || l.date_time,
              period.mode
            ),
            series: [
              { key: "value", name: "Activities", color: "#202860" },
            ],
          },
        ]}
      />

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-red-500" />

            <div className="min-w-0">
              <p className="text-sm font-semibold text-red-700">
                Unable to load activity logs
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <section>
        <ActivityLogSummaryCards
          logs={filteredLogs}
        />
      </section>

      {/* =================================================
          ACTIVITY LOG TABLE
      ================================================= */}

      <section>
        <ActivityLogTable
          logs={filteredLogs}
        />
      </section>
    </div>
  );
}