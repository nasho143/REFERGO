import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import api from "../services/api";

import bgImage from "../assets/mendez-bg.png";
import logo from "../assets/peso-logo.png";
import teamLogo from "../assets/team-logo.png";
import { TEAM_NAME } from "../config/team";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password: step 1 = send a code to the email, step 2 = enter the
  // code and choose a new password.
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);

  // After 3 requests the backend asks the person to wait 2 minutes.
  // The wait is kept in localStorage so refreshing the page does not hide it.
  const LOCK_KEY = "refergo_forgot_lock_until";
  const [lockUntil, setLockUntil] = useState(
    () => Number(localStorage.getItem(LOCK_KEY)) || 0
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (lockUntil <= Date.now()) return undefined;

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [lockUntil]);

  const cooldown = Math.max(0, Math.ceil((lockUntil - now) / 1000));

  const formatWait = (seconds) =>
    `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const startCooldown = (seconds) => {
    const until = Date.now() + Number(seconds) * 1000;
    localStorage.setItem(LOCK_KEY, String(until));
    setLockUntil(until);
    setNow(Date.now());
  };

  const closeForgot = () => {
    setForgotMode(false);
    setForgotStep("email");
    setForgotUsername("");
    setForgotEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNew(false);
  };

  const sendCode = async (e) => {
    if (e) e.preventDefault();

    if (cooldown > 0) return;

    if (!forgotUsername.trim() || !forgotEmail.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please enter your username and registered email.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", {
        username: forgotUsername.trim(),
        email: forgotEmail.trim(),
      });

      if (res.data?.retryAfter) startCooldown(res.data.retryAfter);

      await Swal.fire({
        icon: "success",
        title: "Check Your Email",
        text: res.data?.message || "A 6-digit code was sent to your email.",
      });

      setForgotStep("code");
    } catch (error) {
      if (error.response?.data?.retryAfter) {
        startCooldown(error.response.data.retryAfter);
      }

      Swal.fire({
        icon: error.response?.status === 429 ? "warning" : "error",
        title:
          error.response?.status === 429 ? "Too Many Requests" : "Could Not Send",
        text:
          error.response?.data?.message ||
          "Unable to send the code. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(resetCode.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Check the Code",
        text: "Enter the 6-digit code from your email.",
      });
      return;
    }

    if (newPassword.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Passwords Do Not Match",
        text: "Please type the same password in both fields.",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/auth/reset-password", {
        username: forgotUsername.trim(),
        email: forgotEmail.trim(),
        code: resetCode.trim(),
        password: newPassword,
      });

      await Swal.fire({
        icon: "success",
        title: "Password Changed",
        text: res.data?.message || "You can now sign in.",
      });

      closeForgot();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Could Not Reset Password",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

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
    "mt-1.5 block w-full border border-slate-400 bg-white px-3 py-2 text-[14.5px] text-slate-900";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Masthead */}
      <header
        className="border-b-4 border-red-600"
        style={{
          background:
            "linear-gradient(100deg, #11163a 0%, #202860 55%, #3a4789 100%)",
        }}
      >
        <div className="flex w-full items-center gap-3 px-4 py-3 sm:gap-4 sm:px-8 sm:py-4">
          <img
            src={logo}
            alt="PESO seal"
            className="h-12 w-12 shrink-0 rounded-full bg-white object-contain p-1 sm:h-[72px] sm:w-[72px]"
          />
          <div>
            <p className="gov-office !text-white text-[18px] sm:text-[28px]">
              Public Employment Service Office
            </p>
            <p className="text-[13px] text-blue-100 sm:text-[15px]">
              Municipality of Mendez, Cavite
            </p>
          </div>
        </div>
      </header>

      <main className="grid flex-1 lg:grid-cols-[3fr_2fr]">
        {/* 60%: photo */}
        <div
          aria-hidden="true"
          className="hidden bg-cover bg-no-repeat lg:block"
          style={{
            backgroundImage: `url(${bgImage})`,
            backgroundPosition: "center 64%",
          }}
        />

        {/* 40%: brand, sign in, notice */}
        <div className="flex items-center justify-center bg-slate-100 px-5 py-8 sm:px-8">
          <div className="w-full max-w-[400px] space-y-5">
            <div className="text-center">
              <h1 className="font-serif text-[34px] font-bold leading-none text-blue-600">
                ReferGO
              </h1>
              <p
                className="mt-2 font-serif text-[17px] font-bold leading-snug text-slate-800"
                style={{ textWrap: "balance" }}
              >
                Employment Referral Management System
              </p>
              <span
                aria-hidden="true"
                className="mx-auto mt-3 block h-1 w-14 bg-red-600"
              />
            </div>

            {/* Sign-in / forgot password */}
            <section>
            <div className="gov-panel flex flex-col">
              <h2 className="gov-panel-title !text-white">
                {forgotMode ? "Reset password" : "Sign in"}
              </h2>

              {!forgotMode ? (
                <form
                  onSubmit={handleLogin}
                  className="flex flex-1 flex-col justify-center space-y-4 p-5 sm:p-6"
                >
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
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className={`${fieldClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-pressed={showPassword}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute inset-y-0 right-0 mt-1.5 flex w-11 items-center justify-center text-slate-500 hover:text-blue-600"
                      >
                        {showPassword ? (
                          <FaEyeSlash aria-hidden="true" />
                        ) : (
                          <FaEye aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        onClick={() => setForgotMode(true)}
                        className="text-[13px] font-semibold text-blue-600 underline hover:text-blue-800"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 px-4 py-2.5 text-[15px] font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Signing in..." : "Sign in"}
                  </button>
                </form>
              ) : forgotStep === "email" ? (
                <form
                  onSubmit={sendCode}
                  className="flex flex-1 flex-col justify-center space-y-4 p-5 sm:p-6"
                >
                  <p className="text-[13.5px] leading-6 text-slate-700">
                    Enter your username and registered email. If they match
                    the same account, we will send a 6-digit code to that
                    email.
                  </p>

                  <div>
                    <label
                      htmlFor="forgot-username"
                      className="block text-sm font-bold text-slate-900"
                    >
                      Username
                    </label>
                    <input
                      id="forgot-username"
                      type="text"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      autoComplete="username"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-sm font-bold text-slate-900"
                    >
                      Registered email
                    </label>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      autoComplete="email"
                      className={fieldClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || cooldown > 0}
                    className="w-full bg-blue-600 px-4 py-2.5 text-[15px] font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? "Sending..."
                      : cooldown > 0
                      ? `Wait ${formatWait(cooldown)}`
                      : "Send code"}
                  </button>

                  {cooldown > 0 && (
                    <p
                      role="status"
                      className="text-center text-[13px] font-semibold text-red-600"
                    >
                      Too many requests. You can try again in{" "}
                      {formatWait(cooldown)}.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={closeForgot}
                    className="w-full text-center text-[13px] font-semibold text-blue-600 underline hover:text-blue-800"
                  >
                    Back to sign in
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={submitReset}
                  className="flex flex-1 flex-col justify-center space-y-3.5 p-5 sm:p-6"
                >
                  <p className="text-[13.5px] leading-6 text-slate-700">
                    We sent a 6-digit code to <strong>{forgotEmail}</strong>. It
                    is valid for 10 minutes.
                  </p>

                  <div>
                    <label
                      htmlFor="reset-code"
                      className="block text-sm font-bold text-slate-900"
                    >
                      6-digit code
                    </label>
                    <input
                      id="reset-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) =>
                        setResetCode(e.target.value.replace(/\D/g, ""))
                      }
                      autoComplete="one-time-code"
                      className={`${fieldClass} text-center text-lg tracking-[0.4em]`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-sm font-bold text-slate-900"
                    >
                      New password
                    </label>
                    <div className="relative">
                      <input
                        id="new-password"
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        className={`${fieldClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        aria-pressed={showNew}
                        aria-label={
                          showNew ? "Hide password" : "Show password"
                        }
                        className="absolute inset-y-0 right-0 mt-1.5 flex w-11 items-center justify-center text-slate-500 hover:text-blue-600"
                      >
                        {showNew ? (
                          <FaEyeSlash aria-hidden="true" />
                        ) : (
                          <FaEye aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-sm font-bold text-slate-900"
                    >
                      Confirm new password
                    </label>
                    <input
                      id="confirm-password"
                      type={showNew ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className={fieldClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 px-4 py-2.5 text-[15px] font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Saving..." : "Change password"}
                  </button>

                  <div className="flex justify-between text-[13px] font-semibold">
                    <button
                      type="button"
                      onClick={sendCode}
                      disabled={loading || cooldown > 0}
                      className="text-blue-600 underline hover:text-blue-800 disabled:cursor-not-allowed disabled:text-slate-500 disabled:no-underline"
                    >
                      {cooldown > 0
                        ? `Resend in ${formatWait(cooldown)}`
                        : "Resend code"}
                    </button>
                    <button
                      type="button"
                      onClick={closeForgot}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Back to sign in
                    </button>
                  </div>
                </form>
              )}
            </div>
            </section>

            <p className="gov-notice px-4 py-3 text-[13.5px] leading-6">
              <strong>Notice:</strong> This system is for authorized PESO
              personnel only. Sign in with the account assigned to you.
            </p>
          </div>
        </div>
      </main>

      <footer className="gov-footer">
        <div className="flex w-full flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            &copy; {new Date().getFullYear()} Public Employment Service Office,
            Municipality of Mendez, Cavite
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[14px] font-semibold text-white">
              {TEAM_NAME}
            </span>
            <span className="bg-white px-2 py-1">
              <img
                src={teamLogo}
                alt={`${TEAM_NAME} logo`}
                className="block h-8 w-auto object-contain"
              />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
