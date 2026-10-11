import {
  FaUser,
  FaGlobe,
  FaCalendarAlt,
  FaBuilding,
  FaBriefcase,
  FaExchangeAlt,
  FaUsers,
  FaChartBar,
  FaLock,
  FaCog,
} from "react-icons/fa";

// =====================================================
// DATE FORMAT
// =====================================================

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// =====================================================
// MODULE ICON
// =====================================================

function getModuleIcon(moduleName) {
  const module = String(moduleName || "").toLowerCase();

  if (module.includes("applicant")) {
    return <FaUser />;
  }

  if (module.includes("employer")) {
    return <FaBuilding />;
  }

  if (
    module.includes("vacancy") ||
    module.includes("job")
  ) {
    return <FaBriefcase />;
  }

  if (module.includes("referral")) {
    return <FaExchangeAlt />;
  }

  if (
    module.includes("user management") ||
    module.includes("user")
  ) {
    return <FaUsers />;
  }

  if (module.includes("report")) {
    return <FaChartBar />;
  }

  if (
    module.includes("auth") ||
    module.includes("login")
  ) {
    return <FaLock />;
  }

  return <FaCog />;
}

// =====================================================
// MODULE ICON STYLE
// =====================================================

function getModuleIconStyle(moduleName) {
  const module = String(moduleName || "").toLowerCase();

  if (module.includes("applicant")) {
    return "bg-blue-50 text-[#202860]";
  }

  if (module.includes("employer")) {
    return "bg-green-50 text-green-600";
  }

  if (
    module.includes("vacancy") ||
    module.includes("job")
  ) {
    return "bg-amber-50 text-amber-600";
  }

  if (module.includes("referral")) {
    return "bg-purple-50 text-purple-600";
  }

  if (
    module.includes("user management") ||
    module.includes("user")
  ) {
    return "bg-indigo-50 text-indigo-600";
  }

  if (module.includes("report")) {
    return "bg-cyan-50 text-cyan-600";
  }

  if (
    module.includes("auth") ||
    module.includes("login")
  ) {
    return "bg-slate-100 text-slate-600";
  }

  return "bg-slate-100 text-slate-600";
}

// =====================================================
// DATA HELPERS
// =====================================================

function getLogDate(log) {
  return (
    log.created_at ||
    log.date_time ||
    log.createdAt
  );
}

function getUsername(log) {
  return (
    log.username ||
    log.user_name ||
    "Unknown User"
  );
}

function getUserId(log) {
  return (
    log.user_id ||
    log.userId ||
    null
  );
}

function getModule(log) {
  return log.module || "System";
}

function getActivity(log) {
  return (
    log.activity ||
    log.action ||
    "—"
  );
}

function getIpAddress(log) {
  return (
    log.ip_address ||
    log.ipAddress ||
    "—"
  );
}

// =====================================================
// MODULE DISPLAY
// =====================================================

function ModuleDisplay({ module }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${getModuleIconStyle(
          module
        )}`}
        title={module}
        aria-label={module}
      >
        {getModuleIcon(module)}
      </div>

      <span className="truncate text-sm font-semibold text-slate-700">
        {module}
      </span>
    </div>
  );
}

// =====================================================
// DESKTOP LOG ROW
// =====================================================

function LogRow({ log }) {
  const username = getUsername(log);
  const userId = getUserId(log);
  const module = getModule(log);
  const activity = getActivity(log);
  const ipAddress = getIpAddress(log);

  return (
    <tr className="  transition-colors  hover:bg-slate-50">
      {/* =================================================
          1. DATE & TIME
      ================================================= */}

      <td className="w-[22%]   px-8 py-5 pr-12 align-top">
        <div className="flex items-start gap-4">

          <div className="min-w-0">
            <p className="whitespace-nowrap text-sm font-medium leading-5 text-slate-700">
              {formatDate(getLogDate(log))}
            </p>
          </div>
        </div>
      </td>

      {/* =================================================
          2. USER
      ================================================= */}

      <td className="w-[19%] px-8 py-5 pl-12 align-top">
        <div className="flex items-start gap-4">

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-5 text-slate-700">
              {username}
            </p>

            {userId && (
              <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                User ID: {userId}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* =================================================
          3. MODULE
      ================================================= */}

      <td className="w-[16%] px-8 py-5 align-top">
        <ModuleDisplay module={module} />
      </td>

      {/* =================================================
          4. ACTIVITY
      ================================================= */}

      <td className="w-[28%] px-8 py-5 align-top">
        <p className="break-words text-sm leading-6 text-slate-600">
          {activity}
        </p>
      </td>

      {/* =================================================
          5. IP ADDRESS
      ================================================= */}

      <td className="w-[15%] px-8 py-5 align-top">
        <div className="flex items-start gap-3">
          <FaGlobe className="mt-1 shrink-0 text-slate-400" />

          <span className="break-all text-sm leading-5 text-slate-600">
            {ipAddress}
          </span>
        </div>
      </td>
    </tr>
  );
}

// =====================================================
// MOBILE LOG CARD
// =====================================================

function MobileLogCard({ log }) {
  const username = getUsername(log);
  const userId = getUserId(log);
  const module = getModule(log);
  const activity = getActivity(log);
  const ipAddress = getIpAddress(log);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* =================================================
          USER + MODULE
      ================================================= */}

      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">
              {username}
            </p>

            {userId && (
              <p className="mt-0.5 text-xs text-slate-400">
                User ID: {userId}
              </p>
            )}
          </div>
        </div>

        {/* Module Icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getModuleIconStyle(
            module
          )}`}
          title={module}
          aria-label={module}
        >
          {getModuleIcon(module)}
        </div>
      </div>

      {/* =================================================
          MODULE NAME
      ================================================= */}

      <div className="mt-4 flex items-center gap-2">
        <span className="text-xs font-medium text-slate-400">
          Module
        </span>

        <span className="text-sm font-semibold text-slate-700">
          {module}
        </span>
      </div>

      {/* =================================================
          DATE & TIME
      ================================================= */}

      <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-50 p-3">
        <FaCalendarAlt className="mt-0.5 shrink-0 text-[#202860]" />

        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">
            Date & Time
          </p>

          <p className="mt-1 break-words text-sm font-medium text-slate-700">
            {formatDate(getLogDate(log))}
          </p>
        </div>
      </div>

      {/* =================================================
          ACTIVITY
      ================================================= */}

      <div className="mt-4">
        <p className="text-xs font-medium text-slate-400">
          Activity
        </p>

        <p className="mt-1 break-words text-sm leading-6 text-slate-700">
          {activity}
        </p>
      </div>

      {/* =================================================
          IP ADDRESS
      ================================================= */}

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
        <FaGlobe className="shrink-0 text-slate-400" />

        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-400">
            IP Address
          </p>

          <p className="mt-0.5 break-all text-sm text-slate-600">
            {ipAddress}
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function ActivityLogTable({
  logs = [],
}) {
  // ===================================================
  // EMPTY STATE
  // ===================================================

  if (!logs.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

        <h3 className="mt-4 text-lg font-semibold text-slate-700">
          No activity logs found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          There are no activity records matching your search.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* =================================================
          DESKTOP / TABLET AUDIT LOG
      ================================================= */}

      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1150px] table-fixed border-collapse">
            <thead>
              <tr className="  bg-slate-50">
                {/* DATE */}
                <th className="w-[22%]   px-8 py-4 pr-12 text-left text-xs font-semibold text-slate-500">
                  Date & Time
                </th>

                {/* USER */}
                <th className="w-[19%] px-8 py-4 pl-12 text-left text-xs font-semibold text-slate-500">
                  User
                </th>

                {/* MODULE */}
                <th className="w-[16%] px-8 py-4 text-left text-xs font-semibold text-slate-500">
                  Module
                </th>

                {/* ACTIVITY */}
                <th className="w-[28%] px-8 py-4 text-left text-xs font-semibold text-slate-500">
                  Activity
                </th>

                {/* IP */}
                <th className="w-[15%] px-8 py-4 text-left text-xs font-semibold text-slate-500">
                  IP Address
                </th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log, index) => (
                <LogRow
                  key={
                    log.log_id ||
                    log.id ||
                    log.activity_log_id ||
                    `${getLogDate(log)}-${index}`
                  }
                  log={log}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================
          MOBILE
      ================================================= */}

      <div className="space-y-4 md:hidden">
        {logs.map((log, index) => (
          <MobileLogCard
            key={
              log.log_id ||
              log.id ||
              log.activity_log_id ||
              `${getLogDate(log)}-${index}`
            }
            log={log}
          />
        ))}
      </div>
    </>
  );
}