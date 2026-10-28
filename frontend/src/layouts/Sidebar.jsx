import { NavLink } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

// Primary navigation. Kept in this file so existing imports still resolve,
// but it is now a horizontal government-portal menu rather than a sidebar.
const menu = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Employers", path: "/employers" },
  { name: "Job Vacancies", path: "/vacancies" },
  { name: "Applicants", path: "/applicants" },
  { name: "Referrals", path: "/referrals" },
  { name: "Reports", path: "/reports" },
  { name: "Activity Logs", path: "/activity-logs" },
];

function currentRole() {
  try {
    return JSON.parse(localStorage.getItem("user"))?.role || "";
  } catch {
    return "";
  }
}

export default function Sidebar({
  open = false,
  onToggle = () => {},
  onClose = () => {},
}) {
  // Activity Logs belongs to the Department Head only.
  const isHead = currentRole() === "department_head";
  const visibleMenu = menu.filter(
    (item) => item.path !== "/activity-logs" || isHead
  );

  return (
    <div className="gov-nav">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
        <div className="flex items-stretch justify-between lg:justify-start">
          <p className="flex items-center border-white/25 py-2 pr-5 font-serif text-base font-bold tracking-wide text-white lg:mr-2 lg:border-r">
            REFERGO
          </p>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls="primary-menu"
            className="my-1.5 flex items-center gap-2 border border-white/60 px-3 text-sm font-semibold text-white lg:hidden"
          >
            {open ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
            Menu
          </button>

          {/* Desktop links */}
          <ul className="hidden lg:flex">
            {visibleMenu.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} className="gov-nav-link">
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile links */}
        {open && (
          <ul
            id="primary-menu"
            className="border-t border-white/25 pb-2 lg:hidden"
          >
            {visibleMenu.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className="gov-nav-link !border-b-0 !border-l-4 !border-transparent aria-[current=page]:!border-l-[#f8e000]"
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
