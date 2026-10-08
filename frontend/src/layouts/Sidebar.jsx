import {
  FaTachometerAlt,
  FaBuilding,
  FaBriefcase,
  FaUsers,
  FaExchangeAlt,
  FaChartBar,
  FaHistory,
  FaTimes,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";
import logo from "../assets/peso-logo.png";

export default function Sidebar({
  sidebarOpen = false,
  onClose = () => {},
}) {
  const menu = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/dashboard",
    },
    {
      name: "Employers",
      icon: <FaBuilding />,
      path: "/employers",
    },
    {
      name: "Job Vacancies",
      icon: <FaBriefcase />,
      path: "/vacancies",
    },
    {
      name: "Applicants",
      icon: <FaUsers />,
      path: "/applicants",
    },
    {
      name: "Referrals",
      icon: <FaExchangeAlt />,
      path: "/referrals",
    },
    {
      name: "Reports",
      icon: <FaChartBar />,
      path: "/reports",
    },
    {
      name: "Activity Logs",
      icon: <FaHistory />,
      path: "/activity-logs",
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-blue-900 text-white shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen
          ? "translate-x-0"
          : "-translate-x-full"
      }`}
    >
      {/* ================================
          HEADER
      ================================= */}

      <div className="shrink-0 border-b border-blue-800 px-5 py-4">
        {/* MOBILE CLOSE BUTTON */}
        <div className="mb-2 flex justify-end lg:hidden">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-200 transition hover:bg-blue-800 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        {/* PESO LOGO */}
        <div className="flex justify-center">
          <img
            src={logo}
            alt="PESO Logo"
            className="h-[72px] w-[72px] rounded-full bg-white object-contain p-1 shadow-lg"
          />
        </div>

        {/* REFERGO */}
        <h1 className="mt-3 text-center text-3xl font-bold tracking-[3px]">
          REFERGO
        </h1>

        <p className="mt-1 text-center text-sm text-blue-200">
          Employment Referral
        </p>

        <p className="text-center text-sm text-blue-200">
          Management System
        </p>

        {/* OFFICE INFORMATION */}
        <div className="mt-3 text-center">
          <p className="text-[11px] font-medium text-blue-300">
            PUBLIC EMPLOYMENT SERVICE OFFICE
          </p>

          <p className="text-[11px] text-blue-300">
            Municipality of Mendez, Cavite
          </p>
        </div>
      </div>

      {/* ================================
          NAVIGATION
          NO SCROLLBAR
      ================================= */}

      <nav className="flex-1 overflow-hidden px-3 py-4">
        <div className="space-y-1.5">
          {menu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-lg px-4 py-2.5 text-[15px] font-medium transition-all duration-200 ${
                  isActive
                    ? "border-l-4 border-white bg-blue-700"
                    : "border-l-4 border-transparent hover:bg-blue-800"
                }`
              }
            >
              <span className="text-lg">
                {item.icon}
              </span>

              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
}