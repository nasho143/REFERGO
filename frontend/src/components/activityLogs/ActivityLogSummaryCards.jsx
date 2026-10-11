import StatStrip from "../common/StatStrip";

export default function ActivityLogSummaryCards({ logs = [] }) {
  const today = new Date();

  const isToday = (dateValue) => {
    if (!dateValue) return false;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return false;

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const todayActivities = logs.filter((log) =>
    isToday(log.created_at || log.date_time || log.createdAt)
  ).length;

  const uniqueUsers = new Set(
    logs
      .map(
        (log) =>
          log.username ||
          log.user_name ||
          log.user_id ||
          log.userId ||
          null
      )
      .filter(Boolean)
  ).size;

  const uniqueModules = new Set(
    logs
      .map((log) => log.module || "System")
      .filter(Boolean)
  ).size;

  return (
    <StatStrip
      items={[
        { label: "Total Activities", value: logs.length },
        { label: "Today's Activities", value: todayActivities },
        { label: "Active Users", value: uniqueUsers },
        { label: "Modules Used", value: uniqueModules },
      ]}
    />
  );
}
