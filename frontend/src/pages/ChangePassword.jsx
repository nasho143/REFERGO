import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaKey,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { changePassword } from "../services/authApi";

export default function ChangePassword() {
  const navigate = useNavigate();

  // ======================================
  // USER
  // ======================================
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userId = user?.id;

  // ======================================
  // FORM
  // ======================================
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] =
    useState(false);

  // ======================================
  // SHOW PASSWORD
  // ======================================
  const [showCurrent, setShowCurrent] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  // ======================================
  // INPUT
  // ======================================
  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================
  // SUBMIT
  // ======================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ==================================
    // USER CHECK
    // ==================================
    if (!userId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User ID not found.",
      });

      return;
    }

    // ==================================
    // REQUIRED FIELDS
    // ==================================
    if (
      !form.currentPassword ||
      !form.newPassword ||
      !form.confirmPassword
    ) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Fields",
        text:
          "Please fill in all password fields.",
      });

      return;
    }

    // ==================================
    // PASSWORD LENGTH
    // ==================================
    if (
      form.newPassword.length < 8
    ) {
      Swal.fire({
        icon: "warning",
        title: "Password Too Short",
        text:
          "New password must be at least 8 characters long.",
      });

      return;
    }

    // ==================================
    // PASSWORD MATCH
    // ==================================
    if (
      form.newPassword !==
      form.confirmPassword
    ) {
      Swal.fire({
        icon: "warning",
        title: "Passwords Do Not Match",
        text:
          "New password and confirmation password must match.",
      });

      return;
    }

    // ==================================
    // SAME PASSWORD
    // ==================================
    if (
      form.currentPassword ===
      form.newPassword
    ) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Password",
        text:
          "Your new password must be different from your current password.",
      });

      return;
    }

    setLoading(true);

    try {
      const response =
        await changePassword(
          userId,
          form
        );

      if (response.data?.success) {
        // ==============================
        // CLEAR FORM
        // ==============================
        setForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        await Swal.fire({
          icon: "success",
          title: "Password Changed",
          text:
            "Your password has been changed successfully.",
          timer: 1800,
          showConfirmButton: false,
        });

        navigate("/profile");
      } else {
        throw new Error(
          response.data?.message ||
            "Failed to change password."
        );
      }
    } catch (error) {
      console.error(
        "CHANGE PASSWORD ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Change Password Failed",
        text:
          error.response?.data?.message ||
          "Failed to change your password.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // UI
  // ======================================
  return (
    <div className="w-full">

      {/* ==================================
          HEADER
      ================================== */}

      <div className="
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-4
        mb-6">

        <div>
          <h1>
            Change Password
          </h1>

          <p className="
            text-gray-500
            mt-1">
            Update your account password.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/profile")
          }
          className="
            flex
            items-center
            gap-2
            px-4
            py-2.5
            rounded-lg
            border
            border-gray-300
            bg-white
            text-gray-700
            hover:bg-gray-50
            transition"
        >
          <FaArrowLeft />

          Back to Profile
        </button>

      </div>

      {/* ==================================
          CARD
      ================================== */}

      <div className="
        max-w-3xl
        mx-auto
        bg-white
        rounded-2xl
        shadow-sm
        border
        border-gray-200
        overflow-hidden">

        {/* TOP */}
        <div className="
          bg-[#202860]
          px-8
          py-8
          flex
          items-center
          gap-5">

          <div className="
            w-16
            h-16
            rounded-sm
            bg-white/20
            flex
            items-center
            justify-center">
            <FaKey
              className="
                text-3xl
                text-white"
            />
          </div>

          <div>

            <h2 className="
              text-2xl
              font-bold
              text-white">
              Security Settings
            </h2>

            <p className="
              text-[#eef0f8]
              mt-1">
              Keep your account secure.
            </p>

          </div>

        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-8"
        >

          {/* CURRENT PASSWORD */}
          <div className="mb-6">

            <label className="
              block
              text-sm
              font-semibold
              text-gray-700
              mb-2">
              Current Password
            </label>

            <div className="relative">

              <FaLock
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400"
              />

              <input
                type={
                  showCurrent
                    ? "text"
                    : "password"
                }
                name="currentPassword"
                value={
                  form.currentPassword
                }
                onChange={handleChange}
                placeholder="Enter current password"
                autoComplete="current-password"
                className="
                  w-full
                  pl-11
                  pr-12
                  py-3
                  border
                  border-gray-300
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-[#202860]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrent(
                    !showCurrent
                  )
                }
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  hover:text-gray-600"
              >
                {showCurrent ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>
          </div>

          {/* NEW PASSWORD */}
          <div className="mb-6">

            <label className="
              block
              text-sm
              font-semibold
              text-gray-700
              mb-2">
              New Password
            </label>

            <div className="relative">

              <FaLock
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400"
              />

              <input
                type={
                  showNew
                    ? "text"
                    : "password"
                }
                name="newPassword"
                value={
                  form.newPassword
                }
                onChange={handleChange}
                placeholder="Enter new password"
                autoComplete="new-password"
                className="
                  w-full
                  pl-11
                  pr-12
                  py-3
                  border
                  border-gray-300
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-[#202860]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNew(
                    !showNew
                  )
                }
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  hover:text-gray-600"
              >
                {showNew ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

            <p className="
              text-xs
              text-gray-500
              mt-2">
              Password must be at least 8
              characters.
            </p>

          </div>

          {/* CONFIRM PASSWORD */}
          <div className="mb-8">

            <label className="
              block
              text-sm
              font-semibold
              text-gray-700
              mb-2">
              Confirm New Password
            </label>

            <div className="relative">

              <FaLock
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400"
              />

              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={
                  form.confirmPassword
                }
                onChange={handleChange}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="
                  w-full
                  pl-11
                  pr-12
                  py-3
                  border
                  border-gray-300
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-[#202860]"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(
                    !showConfirm
                  )
                }
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                  hover:text-gray-600"
              >
                {showConfirm ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>
          </div>

          {/* BUTTONS */}
          <div className="
            flex
            justify-end
            gap-3
            pt-6
            border-t">

            <button
              type="button"
              onClick={() =>
                navigate("/profile")
              }
              className="
                px-5
                py-3
                rounded-lg
                border
                border-gray-300
                text-gray-700
                hover:bg-gray-50
                transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                flex
                items-center
                gap-2
                px-6
                py-3
                rounded-lg
                bg-[#202860]
                text-white
                hover:bg-[#202860]
                disabled:opacity-60
                transition"
            >
              <FaLock />

              {loading
                ? "Changing..."
                : "Change Password"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}