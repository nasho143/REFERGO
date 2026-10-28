import { useEffect, useState } from "react";

// Live date and time, shown in the header next to the bell and account menu.
export default function HeaderClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  const date = now.toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const time = now.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className="hidden border-r border-slate-300 pr-4 text-right leading-tight lg:block"
      aria-label={`${date}, ${time}`}
    >
      <p className="text-[18px] font-bold text-blue-600">{time}</p>
      <p className="text-[12px] text-slate-600">{date}</p>
    </div>
  );
}
