import { useEffect, useMemo, useState } from "react";

import { getActivityLogs } from "../services/activityLogApi";

import ActivityLogToolbar from "../components/activityLogs/ActivityLogToolbar";
import ActivityLogSummaryCards from "../components/activityLogs/ActivityLogSummaryCards";
import ActivityLogTable from "../components/activityLogs/ActivityLogTable";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
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

  const filteredLogs = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    // No search keyword
    if (!keyword) {
      return logs;
    }

    return logs.filter((log) => {
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

      const ipAddress =
        log.ip_address ||
        log.ipAddress ||
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

        String(ipAddress)
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
  }, [logs, search]);

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg
              className="h-6 w-6 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading activity logs...
          </p>
        </div>
      </div>
    );
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
        totalActivities={filteredLogs.length}
      />

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />

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