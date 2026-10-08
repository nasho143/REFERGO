import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaCheckCircle,
} from "react-icons/fa";

import api from "../services/api";

import bgImage from "../assets/mendez-bg.png";
import logo from "../assets/peso-logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please enter your username and password.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      await Swal.fire({
        icon: "success",
        title: "Welcome!",
        text: res.data.message || "Login Successful",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text:
          error.response?.data?.message ||
          "Unable to login. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* =========================================
          DARK OVERLAY
      ========================================= */}
      <div className="absolute inset-0 bg-[#0B2A63]/75" />

      {/* =========================================
          MAIN CONTENT
      ========================================= */}
      <div className="relative z-10 flex min-h-screen w-full">

        {/* =========================================
            LEFT SIDE
        ========================================= */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-12 py-10">

          <div className="w-full max-w-xl text-center text-white">

            {/* PESO LOGO */}
            <img
              src={logo}
              alt="PESO Logo"
              className="mx-auto mb-5 h-32 w-32 object-contain drop-shadow-2xl"
            />

            {/* REFERGO */}
            <h1 className="text-5xl font-black tracking-[8px] leading-none">
              REFERGO
            </h1>

            {/* SYSTEM NAME */}
            <h2 className="mt-3 text-xl font-light leading-relaxed text-slate-100">
              Referral Management
              <br />
              Information System
            </h2>

            {/* YELLOW LINE */}
            <div className="mx-auto my-5 h-1 w-64 rounded-full bg-yellow-400" />

            {/* DESCRIPTION */}
            <p className="mx-auto max-w-lg text-sm leading-6 text-slate-100">
              Connecting employers, applicants, and the
              Public Employment Service Office of Mendez,
              Cavite through one centralized referral
              management platform.
            </p>

            {/* FEATURES */}
            <div className="mx-auto mt-6 flex w-fit flex-col gap-3 text-left text-sm">

              <div className="flex items-center gap-3">
                <FaCheckCircle className="shrink-0 text-yellow-400" />
                <span>Applicant Management</span>
              </div>

              <div className="flex items-center gap-3">
                <FaCheckCircle className="shrink-0 text-yellow-400" />
                <span>Employer Management</span>
              </div>

              <div className="flex items-center gap-3">
                <FaCheckCircle className="shrink-0 text-yellow-400" />
                <span>Job Vacancy Management</span>
              </div>

              <div className="flex items-center gap-3">
                <FaCheckCircle className="shrink-0 text-yellow-400" />
                <span>Referral Tracking</span>
              </div>

              <div className="flex items-center gap-3">
                <FaCheckCircle className="shrink-0 text-yellow-400" />
                <span>Reports & Analytics</span>
              </div>

            </div>

            {/* OFFICE INFORMATION */}
            <div className="mx-auto mt-7 max-w-md border-t border-white/30 pt-5">

              <p className="text-xs font-semibold tracking-[3px] text-yellow-300">
                PUBLIC EMPLOYMENT SERVICE OFFICE
              </p>

              <p className="mt-2 text-xs text-slate-200">
                Municipality of Mendez, Cavite
              </p>

            </div>

          </div>

        </div>

        {/* =========================================
            RIGHT SIDE
        ========================================= */}
        <div className="flex w-full items-center justify-center px-5 py-8 sm:px-8 lg:w-1/2">

          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl sm:p-8">

            {/* =====================================
                LOGIN HEADER
            ===================================== */}
            <div className="mb-7 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0B2A63] text-white shadow-lg">
                <FaSignInAlt className="text-xl" />
              </div>

              <h2 className="text-2xl font-bold text-[#0B2A63]">
                Welcome Back
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Login to access your account
              </p>

            </div>

            {/* =====================================
                LOGIN FORM
            ===================================== */}
            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* USERNAME */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Username
                </label>

                <div className="relative">

                  <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value)
                    }
                    placeholder="Enter username"
                    autoComplete="username"
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-3 text-sm text-gray-800 outline-none transition focus:border-[#0B2A63] focus:ring-2 focus:ring-[#0B2A63]/20"
                  />

                </div>

              </div>

              {/* PASSWORD */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Password
                </label>

                <div className="relative">

                  <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-11 text-sm text-gray-800 outline-none transition focus:border-[#0B2A63] focus:ring-2 focus:ring-[#0B2A63]/20"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-[#0B2A63]"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>

                </div>

              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B2A63] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#09204b] disabled:cursor-not-allowed disabled:opacity-70"
              >

                {loading ? (
                  "Logging in..."
                ) : (
                  <>
                    <FaSignInAlt />
                    Login
                  </>
                )}

              </button>

            </form>

            {/* =====================================
                FOOTER
            ===================================== */}
            <div className="mt-7 border-t border-gray-100 pt-5 text-center">

              <p className="text-xs text-gray-400">
                © 2026 REFERGO
              </p>

              <p className="mt-1 text-xs text-gray-400">
                PESO Mendez, Cavite
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* =========================================
          MOBILE BRANDING
      ========================================= */}
      <div className="absolute left-0 right-0 top-5 z-20 flex justify-center lg:hidden">

        <div className="text-center text-white">

          <img
            src={logo}
            alt="PESO Logo"
            className="mx-auto h-20 w-20 object-contain drop-shadow-xl"
          />

          <h1 className="mt-2 text-2xl font-black tracking-[4px]">
            REFERGO
          </h1>

          <p className="mt-1 text-xs text-slate-100">
            Referral Management Information System
          </p>

        </div>

      </div>

    </div>
  );
}