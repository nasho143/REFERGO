import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaClock } from "react-icons/fa";

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
      return "bg-blue-50 text-[#202860]";
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
    <div className="border border-slate-300 bg-white">

      {/* Header */}
      <div className="flex items-baseline justify-between border-b border-slate-300 bg-slate-50 px-4 py-2">
        <h2 className="!text-[15px]">Recent activity</h2>
        <Link
          to="/activity-logs"
          className="text-[12.5px] font-semibold text-blue-600 underline hover:text-blue-800"
        >
          View all
        </Link>
      </div>

      {/* Empty State */}
      {activities.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">
          No recent activities.
        </p>
      ) : (
        <div className="divide-y divide-slate-200">
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
                className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50"
              >

                {/* User Icon */}

                {/* Activity Details */}
                <div className="min-w-0 flex-1">

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-800">
                      {username}
                    </p>

                    {module && (
                      <span
                        className={`w-fit rounded-sm px-2.5 py-1 text-xs font-semibold ${getModuleStyle(
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