import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

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

  const fieldClass =
    "mt-1.5 block w-full border border-slate-400 bg-white px-3 py-2.5 text-[15px] text-slate-900";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Republic strip */}
      <div className="gov-strip">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-1.5 sm:px-6">
          Republic of the Philippines
        </div>
      </div>

      {/* Masthead */}
      <header className="gov-masthead">
        <div className="mx-auto flex w-full max-w-[1180px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          <img
            src={logo}
            alt="PESO seal"
            className="h-12 w-12 shrink-0 object-contain sm:h-[72px] sm:w-[72px]"
          />
          <div>
            <p className="gov-office text-[18px] sm:text-[28px]">
              Public Employment Service Office
            </p>
            <p className="text-[13px] text-slate-600 sm:text-[15px]">
              Municipality of Mendez, Cavite
            </p>
          </div>
        </div>
        <div className="gov-nav">
          <div className="mx-auto w-full max-w-[1180px] px-4 py-2.5 font-serif text-lg font-bold tracking-wide text-white sm:px-6">
            REFERGO
            <span className="ml-3 font-sans text-sm font-normal tracking-normal text-white/85">
              Employment Referral Management System
            </span>
          </div>
        </div>
      </header>

      <main
        className="flex flex-1 items-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundPosition: "center 64%",
        }}
      >
        <div className="mx-auto grid w-full max-w-[1180px] items-center gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[580px_380px] lg:justify-center lg:gap-6 lg:py-12">
          {/* About the system */}
          <section className="gov-panel order-2 p-6 sm:p-7 lg:order-1">
            <h1 className="font-serif text-[24px] font-bold leading-tight text-blue-600">
              Employment Referral Management System
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-slate-700">
              An office information system for recording and monitoring
              employment referrals and related applicant, employer, and vacancy
              records.
            </p>

            <p className="gov-notice mt-5 px-4 py-3 text-[14px] leading-6">
              <strong>Notice:</strong> This system is for authorized PESO
              personnel only. Sign in with the account assigned to you.
            </p>
          </section>

          {/* Sign-in form */}
          <section className="order-1 lg:order-2">
            <div className="gov-panel">
              <h2 className="gov-panel-title !text-white">Sign in</h2>

              <form onSubmit={handleLogin} className="space-y-5 p-5 sm:p-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-bold text-slate-900"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-slate-900"
                  >
                    Password
                  </label>
                  <div className="flex">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className={`${fieldClass} border-r-0`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-pressed={showPassword}
                      className="mt-1.5 w-20 shrink-0 border border-slate-400 bg-slate-100 text-sm font-semibold text-blue-600 hover:bg-slate-200"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 px-4 py-3 text-[15px] font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>

      <footer className="gov-footer">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-4 sm:px-6">
          &copy; {new Date().getFullYear()} Public Employment Service Office,
          Municipality of Mendez, Cavite
        </div>
      </footer>
    </div>
  );
}
