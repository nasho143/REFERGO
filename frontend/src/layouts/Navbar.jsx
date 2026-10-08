import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  FaUserCircle,
  FaChevronDown,
  FaSignOutAlt,
  FaBars,
  FaUser,
  FaLock,
  FaUserCog,
} from "react-icons/fa";

import Swal from "sweetalert2";
import api from "../services/api";

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  // ======================================
  // GET CURRENT USER
  // ======================================

  let user = null;

  try {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      user = JSON.parse(storedUser);
    }
  } catch (error) {
    console.error("USER DATA PARSE ERROR:", error);
  }

  // ======================================
  // ROLE LABEL
  // ======================================

  const getRoleLabel = (role) => {
    switch (role) {
      case "peso_staff":
        return "PESO Staff";

      case "department_head":
        return "Department Head";

      default:
        return "User";
    }
  };

  const roleLabel = getRoleLabel(user?.role);

  // ======================================
  // DEPARTMENT HEAD CHECK
  // ======================================

  const isDepartmentHead =
    user?.role === "department_head";

  // ======================================
  // PAGE TITLES
  // ======================================

  const pageTitles = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/employers": "Employers",
    "/vacancies": "Job Vacancies",
    "/applicants": "Applicants",
    "/referrals": "Referrals",
    "/reports": "Reports",
    "/activity-logs": "Activity Logs",
    "/profile": "My Profile",
    "/change-password": "Change Password",
    "/users": "User Management",
  };

  const title =
    pageTitles[location.pathname] || "REFERGO";

  // ======================================
  // DATE
  // ======================================

  const date = new Date().toLocaleDateString(
    "en-PH",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // ======================================
  // GREETING
  // ======================================

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

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
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
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

  // ======================================
  // RENDER
  // ======================================

  return (
    <header
      className="
        fixed
        top-0
        right-0
        z-40
        flex
        h-20
        w-full
        items-center
        justify-between
        bg-white
        px-4
        shadow
        sm:px-5
        lg:left-72
        lg:w-[calc(100%-18rem)]
        lg:px-8
      "
    >

      {/* ==================================
          LEFT SECTION
      ================================== */}

      <div
        className="
          flex
          min-w-0
          items-center
          gap-3
          sm:gap-4
        "
      >

        {/* ==================================
            MOBILE MENU BUTTON
        ================================== */}

        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-xl
            text-gray-700
            transition
            hover:bg-gray-100
            lg:hidden
          "
        >
          <FaBars />
        </button>

        {/* ==================================
            PAGE TITLE
        ================================== */}

        <div className="min-w-0">

          <h2
            className="
              truncate
              text-lg
              font-bold
              text-gray-800
              sm:text-xl
              lg:text-2xl
            "
          >
            {title}
          </h2>

          <p
            className="
              hidden
              truncate
              text-xs
              text-gray-500
              sm:block
              sm:text-sm
            "
          >
            {date}
          </p>

        </div>
      </div>


      {/* ==================================
          RIGHT SECTION
      ================================== */}

      <div
        className="
          relative
          shrink-0
        "
        ref={dropdownRef}
      >

        {/* ==================================
            USER BUTTON
        ================================== */}

        <button
          type="button"
          onClick={() =>
            setDropdownOpen(
              (prev) => !prev
            )
          }
          aria-expanded={dropdownOpen}
          aria-label="Open user menu"
          className="
            flex
            items-center
            gap-2
            rounded-lg
            px-2
            py-2
            transition
            hover:bg-gray-100
            sm:gap-3
            sm:px-3
          "
        >

          {/* USER ICON */}

          <FaUserCircle
            className="
              text-3xl
              text-blue-700
              sm:text-4xl
            "
          />

          {/* USER DETAILS */}

          <div
            className="
              hidden
              text-left
              md:block
            "
          >

            <h3 className="font-semibold text-gray-800">
              {roleLabel}
            </h3>

            <p className="text-sm text-gray-500">
              {greeting}
            </p>

          </div>

          {/* ARROW */}

          <FaChevronDown
            className={`
              hidden
              text-xs
              text-gray-500
              transition-transform
              duration-300
              sm:block

              ${
                dropdownOpen
                  ? "rotate-180"
                  : ""
              }
            `}
          />

        </button>


        {/* ==================================
            DROPDOWN
        ================================== */}

        {dropdownOpen && (
          <div
            className="
              absolute
              right-0
              top-full
              mt-2
              w-[calc(100vw-2rem)]
              max-w-64
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-white
              shadow-xl
            "
          >

            {/* ==================================
                USER INFORMATION
            ================================== */}

            <div
              className="
                bg-gray-50
                px-4
                py-4
                sm:px-5
              "
            >

              <h3
                className="
                  truncate
                  font-semibold
                  text-gray-800
                "
              >
                {user?.full_name ||
                  "System Administrator"}
              </h3>

              <p
                className="
                  truncate
                  text-sm
                  text-gray-500
                "
              >
                {user?.username || "admin"}
              </p>

              <p
                className="
                  mt-1
                  text-xs
                  font-semibold
                  text-blue-600
                "
              >
                {roleLabel}
              </p>

            </div>


            {/* ==================================
                MY PROFILE
            ================================== */}

            <button
              type="button"
              onClick={() => {
                navigate("/profile");
                setDropdownOpen(false);
              }}
              className="
                flex
                w-full
                items-center
                gap-3
                px-4
                py-3
                text-left
                transition
                hover:bg-gray-100
                sm:px-5
              "
            >

              <FaUser className="shrink-0 text-blue-600" />

              <span>
                My Profile
              </span>

            </button>


            {/* ==================================
                USER MANAGEMENT
                DEPARTMENT HEAD ONLY
            ================================== */}

            {isDepartmentHead && (
              <button
                type="button"
                onClick={() => {
                  navigate("/users");
                  setDropdownOpen(false);
                }}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  px-4
                  py-3
                  text-left
                  transition
                  hover:bg-gray-100
                  sm:px-5
                "
              >

                <FaUserCog className="shrink-0 text-purple-600" />

                <span>
                  User Management
                </span>

              </button>
            )}


            {/* ==================================
                CHANGE PASSWORD
            ================================== */}

            <button
              type="button"
              onClick={() => {
                navigate(
                  "/change-password"
                );
                setDropdownOpen(false);
              }}
              className="
                flex
                w-full
                items-center
                gap-3
                px-4
                py-3
                text-left
                transition
                hover:bg-gray-100
                sm:px-5
              "
            >

              <FaLock className="shrink-0 text-green-600" />

              <span>
                Change Password
              </span>

            </button>


            <hr className="border-gray-200" />


            {/* ==================================
                LOGOUT
            ================================== */}

            <button
              type="button"
              onClick={handleLogout}
              className="
                flex
                w-full
                items-center
                gap-3
                px-4
                py-3
                text-left
                text-red-600
                transition
                hover:bg-red-50
                sm:px-5
              "
            >

              <FaSignOutAlt />

              <span>
                Logout
              </span>

            </button>

          </div>
        )}

      </div>

    </header>
  );
}