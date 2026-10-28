import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";

import { getNotifications } from "../services/dashboardApi";

const SEEN_KEY = "refergo_seen_notifications";
const REFRESH_MS = 60000;

const signature = (item) => `${item.id}:${item.count}`;

function readSeen() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

// Bell in the header. The badge counts notifications you have not opened yet;
// a notification comes back as new when its count changes.
export default function NotificationBell() {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const [items, setItems] = useState([]);
  const [seen, setSeen] = useState(readSeen);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await getNotifications();
      const list = response?.data?.data;
      setItems(Array.isArray(list) ? list : []);
      setFailed(false);
    } catch (error) {
      console.error("NOTIFICATIONS ERROR:", error);
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    // Initial fetch, then keep the badge fresh.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    const onDown = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const unread = items.filter((item) => !seen.has(signature(item))).length;

  const toggle = () => {
    const next = !open;
    setOpen(next);

    if (next) {
      load();
      const all = new Set(items.map(signature));
      localStorage.setItem(SEEN_KEY, JSON.stringify([...all]));
      setSeen(all);
    }
  };

  const go = (link) => {
    setOpen(false);
    navigate(link);
  };

  return (
    <div className="relative shrink-0" ref={wrapperRef}>
      <button
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          unread > 0 ? `Notifications, ${unread} new` : "Notifications"
        }
        className="relative flex h-10 w-10 items-center justify-center border border-slate-300 bg-white text-blue-600 hover:border-blue-600"
      >
        <FaBell aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center bg-red-600 px-1 text-[11px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-80 max-w-[90vw] border border-slate-400 bg-white shadow-xl"
        >
          <div className="border-b border-slate-300 bg-slate-50 px-4 py-2.5">
            <p className="text-sm font-bold text-slate-900">Notifications</p>
          </div>

          {failed && items.length === 0 ? (
            <p className="px-4 py-5 text-sm text-slate-600">
              Notifications could not be loaded.
            </p>
          ) : items.length === 0 ? (
            <p className="px-4 py-5 text-sm text-slate-600">
              You are all caught up.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-200 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => go(item.link)}
                    className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-amber-50"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex h-6 min-w-6 items-center justify-center px-1 text-[12px] font-bold text-white"
                      style={{
                        background:
                          item.type === "alert"
                            ? "#e01838"
                            : item.type === "approval"
                            ? "#8a7600"
                            : "#202860",
                      }}
                    >
                      {item.count}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-semibold text-slate-900">
                        {item.title}
                      </span>
                      <span className="block text-[12.5px] leading-5 text-slate-600">
                        {item.message}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
