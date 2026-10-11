import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { FaChevronDown } from "react-icons/fa";

import Swal from "sweetalert2";
import api from "../services/api";
import logo from "../assets/peso-logo.png";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // Current user
  let user = null;

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("USER DATA PARSE ERROR:", error);
  }

  const roleLabel =
    user?.role === "department_head"
      ? "Department Head"
      : user?.role === "peso_staff"
      ? "PESO Staff"
      : "User";

  const isDepartmentHead = user?.role === "department_head";

  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout = async () => {
    setDropdownOpen(false);

    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#202860",
      cancelButtonColor: "#5c6280",
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      allowOutsideClick: false,
      allowEscapeKey: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      if (token) {
        try {
          await api.post("/auth/logout", {
            userId: user?.id || null,
            username:
              user?.username || "admin",
          });
        } catch (logoutError) {
          console.error(
            "LOGOUT ACTIVITY ERROR:",
            logoutError
          );
        }
      }
    } catch (error) {
      console.error(
        "LOGOUT ERROR:",
        error
      );
    }

    // ==================================
    // CLEAR SESSION
    // ==================================

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // ==================================
    // LOGOUT SUCCESS
    // ==================================

    await Swal.fire({
      icon: "success",
      title: "Logged Out",
      text:
        "You have been logged out successfully.",
      timer: 1500,
      showConfirmButton: false,
      allowOutsideClick: false,
    });

    navigate("/login", {
      replace: true,
    });
  };

  // ======================================
  // CLOSE DROPDOWN OUTSIDE
  // ======================================

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ======================================
  // CLOSE DROPDOWN WHEN ROUTE CHANGES
  // ======================================

  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const menuItem =
    "block w-full px-4 py-2.5 text-left text-sm text-slate-800 hover:bg-amber-50 focus-visible:bg-amber-50";

  return (
    <header>
      {/* Republic strip */}
      <div className="gov-strip">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-4 py-1.5 sm:px-6">
          <span>Republic of the Philippines</span>
          <span className="hidden sm:inline">{today}</span>
        </div>
      </div>

      {/* Office masthead */}
      <div className="gov-masthead">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <img
              src={logo}
              alt="PESO seal"
              className="h-11 w-11 shrink-0 object-contain sm:h-[68px] sm:w-[68px]"
            />
            <div className="min-w-0">
              <p className="gov-office text-[17px] sm:text-[26px]">
                Public Employment Service Office
              </p>
              <p className="text-[12.5px] text-slate-600 sm:text-[14.5px]">
                Municipality of Mendez, Cavite
              </p>
            </div>
          </div>

          {/* Signed-in user */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
              className="flex items-center gap-3 border border-slate-300 bg-white px-3 py-2 text-left hover:border-blue-600"
            >
              <span className="hidden min-w-0 md:block">
                <span className="block max-w-[200px] truncate text-sm font-bold text-slate-900">
                  {user?.full_name || "System Administrator"}
                </span>
                <span className="block text-[12.5px] text-slate-600">
                  {roleLabel}
                </span>
              </span>
              <span className="text-sm font-semibold text-blue-600 md:hidden">
                Account
              </span>
              <FaChevronDown
                aria-hidden="true"
                className={`text-[11px] text-slate-500 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1 w-64 border border-slate-400 bg-white shadow-xl"
              >
                <div className="border-b border-slate-300 bg-slate-50 px-4 py-3">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {user?.full_name || "System Administrator"}
                  </p>
                  <p className="truncate text-[13px] text-slate-600">
                    Username: {user?.username || "admin"}
                  </p>
                  <p className="text-[13px] text-slate-600">{roleLabel}</p>
                </div>

                <button
                  type="button"
                  role="menuitem"
                  className={menuItem}
                  onClick={() => {
                    navigate("/profile");
                    setDropdownOpen(false);
                  }}
                >
                  My Profile
                </button>

                {isDepartmentHead && (
                  <button
                    type="button"
                    role="menuitem"
                    className={menuItem}
                    onClick={() => {
                      navigate("/users");
                      setDropdownOpen(false);
                    }}
                  >
                    User Management
                  </button>
                )}

                <button
                  type="button"
                  role="menuitem"
                  className={menuItem}
                  onClick={() => {
                    navigate("/change-password");
                    setDropdownOpen(false);
                  }}
                >
                  Change Password
                </button>

                <button
                  type="button"
                  role="menuitem"
                  className={`${menuItem} border-t border-slate-300 font-semibold !text-red-700`}
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
