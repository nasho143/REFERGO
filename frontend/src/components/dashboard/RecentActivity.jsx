import { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaUser,
  FaClock,
} from "react-icons/fa";

import { getActivityLogs } from "../../services/activityLogApi";

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        const response = await getActivityLogs();

        const responseData = response?.data;

        let logs = [];

        if (Array.isArray(responseData)) {
          logs = responseData;
        } else if (Array.isArray(responseData?.data)) {
          logs = responseData.data;
        } else if (Array.isArray(responseData?.logs)) {
          logs = responseData.logs;
        }

        setActivities(logs.slice(0, 5));
      } catch (error) {
        console.error(
          "LOAD RECENT ACTIVITIES ERROR:",
          error
        );

        setActivities([]);
      }
    };

    loadRecentActivities();
  }, []);

  const getUsername = (activity) => {
    return (
      activity.username ||
      activity.user_name ||
      "System"
    );
  };

  const getActivity = (activity) => {
    return (
      activity.activity ||
      activity.action ||
      "System activity"
    );
  };

  const getModule = (activity) => {
    return activity.module || "System";
  };

  const getDate = (activity) => {
    const value =
      activity.created_at ||
      activity.timestamp ||
      activity.date ||
      activity.activity_date;

    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getModuleStyle = (module) => {
    const value = String(module).toLowerCase();

    if (value.includes("applicant")) {
      return "bg-blue-50 text-blue-700";
    }

    if (value.includes("employer")) {
      return "bg-green-50 text-green-700";
    }

    if (
      value.includes("vacancy") ||
      value.includes("job")
    ) {
      return "bg-amber-50 text-amber-700";
    }

    if (value.includes("referral")) {
      return "bg-purple-50 text-purple-700";
    }

    if (
      value.includes("login") ||
      value.includes("auth")
    ) {
      return "bg-indigo-50 text-indigo-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800 sm:text-xl">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest activities performed in the system.
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FaClipboardList />
        </div>
      </div>

      {/* Empty State */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12">
          <FaClipboardList className="mb-4 text-4xl text-slate-300" />

          <h3 className="text-lg font-semibold text-slate-700">
            No recent activities
          </h3>

          <p className="mt-2 max-w-md px-4 text-center text-sm text-slate-500">
            Activities will appear here once users perform
            actions in the system.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity, index) => {
            const username = getUsername(activity);
            const action = getActivity(activity);
            const module = getModule(activity);
            const date = getDate(activity);

            return (
              <div
                key={
                  activity.log_id ||
                  activity.id ||
                  `${username}-${index}`
                }
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200 hover:shadow-sm"
              >

                {/* User Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <FaUser />
                </div>

                {/* Activity Details */}
                <div className="min-w-0 flex-1">

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-800">
                      {username}
                    </p>

                    {module && (
                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${getModuleStyle(
                          module
                        )}`}
                      >
                        {module}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-600">
                    {action}
                  </p>

                  {date && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                      <FaClock />
                      <span>{date}</span>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}