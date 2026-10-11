import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaSave,
  FaEdit,
  FaArrowLeft,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  getProfile,
  updateProfile,
} from "../services/authApi";

export default function Profile() {
  const navigate = useNavigate();

  // ======================================
  // CURRENT USER
  // ======================================
  const storedUser =
    JSON.parse(
      localStorage.getItem("user") || "{}"
    );

  const userId = storedUser?.id;

  // ======================================
  // PROFILE STATE
  // ======================================
  const [profile, setProfile] = useState({
    username:
      storedUser?.username || "",
    email:
      storedUser?.email || "",
    full_name:
      storedUser?.full_name || "",
    first_name:
      storedUser?.first_name || "",
    last_name:
      storedUser?.last_name || "",
  });

  const [loading, setLoading] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  // ======================================
  // LOAD PROFILE
  // ======================================
  const handleLoadProfile = async () => {
    if (!userId) {
      return;
    }

    try {
      const response =
        await getProfile(userId);

      if (
        response.data?.success &&
        response.data?.user
      ) {
        const user =
          response.data.user;

        setProfile({
          username:
            user.username || "",
          email:
            user.email || "",
          full_name:
            user.full_name || "",
          first_name:
            user.first_name || "",
          last_name:
            user.last_name || "",
        });
      }
    } catch (error) {
      console.error(
        "GET PROFILE ERROR:",
        error
      );
    }
  };

  // ======================================
  // LOAD PROFILE BUTTON
  // ======================================
  const handleRefreshProfile =
    async () => {
      await handleLoadProfile();
    };

  // ======================================
  // HANDLE INPUT
  // ======================================
  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ======================================
  // UPDATE PROFILE
  // ======================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User ID not found.",
      });

      return;
    }

    setLoading(true);

    try {
      const response =
        await updateProfile(
          userId,
          profile
        );

      if (response.data?.success) {
        // ==============================
        // UPDATE LOCAL STORAGE
        // ==============================
        const updatedUser = {
          ...storedUser,
          username:
            profile.username,
          email:
            profile.email,
          full_name:
            profile.full_name,
          first_name:
            profile.first_name,
          last_name:
            profile.last_name,
        };

        localStorage.setItem(
          "user",
          JSON.stringify(
            updatedUser
          )
        );

        setEditing(false);

        await Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text:
            "Your profile has been updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(
          response.data?.message ||
            "Failed to update profile."
        );
      }
    } catch (error) {
      console.error(
        "UPDATE PROFILE ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.response?.data?.message ||
          "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // CANCEL EDIT
  // ======================================
  const handleCancel = () => {
    setProfile({
      username:
        storedUser?.username || "",
      email:
        storedUser?.email || "",
      full_name:
        storedUser?.full_name || "",
      first_name:
        storedUser?.first_name || "",
      last_name:
        storedUser?.last_name || "",
    });

    setEditing(false);
  };

  // ======================================
  // UI
  // ======================================
  return (
    <div className="w-full">

      {/* ==================================
          HEADER
      ================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <div>
          <h1>
            My Profile
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your account information.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
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

            Back
          </button>

          {!editing && (
            <button
              type="button"
              onClick={() =>
                setEditing(true)
              }
              className="
                flex
                items-center
                gap-2
                px-5
                py-2.5
                rounded-lg
                bg-[#202860]
                text-white
                hover:bg-[#202860]
                transition"
            >
              <FaEdit />

              Edit Profile
            </button>
          )}

        </div>
      </div>

      {/* ==================================
          PROFILE CARD
      ================================== */}

      <div className="
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
          flex-col
          sm:flex-row
          items-center
          gap-5">

          <FaUserCircle
            className="
              text-7xl
              text-white"
          />

          <div className="text-center sm:text-left">

            <h2 className="
              text-2xl
              font-bold
              text-white">
              {profile.full_name ||
                profile.username ||
                "Administrator"}
            </h2>

            <p className="
              text-[#eef0f8]
              mt-1">
              {profile.username ||
                "admin"}
            </p>

            <span className="
              inline-block
              mt-3
              px-3
              py-1
              rounded-sm
              bg-white/20
              text-white
              text-sm">
              Administrator
            </span>

          </div>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="p-8"
        >

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2
            gap-6">

            {/* FULL NAME */}
            <div className="md:col-span-2">

              <label className="
                block
                text-sm
                font-semibold
                text-gray-700
                mb-2">
                Full Name
              </label>

              <div className="relative">

                <FaUser
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400"
                />

                <input
                  type="text"
                  name="full_name"
                  value={
                    profile.full_name
                  }
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Enter your full name"
                  className="
                    w-full
                    pl-11
                    pr-4
                    py-3
                    border
                    border-gray-300
                    rounded-lg
                    outline-none
                    focus:ring-2
                    focus:ring-[#202860]
                    disabled:bg-gray-100
                    disabled:text-gray-600"
                />

              </div>
            </div>

            {/* FIRST NAME */}
            <div>

              <label className="
                block
                text-sm
                font-semibold
                text-gray-700
                mb-2">
                First Name
              </label>

              <input
                type="text"
                name="first_name"
                value={
                  profile.first_name
                }
                onChange={handleChange}
                disabled={!editing}
                placeholder="First name"
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-gray-300
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-[#202860]
                  disabled:bg-gray-100"
              />

            </div>

            {/* LAST NAME */}
            <div>

              <label className="
                block
                text-sm
                font-semibold
                text-gray-700
                mb-2">
                Last Name
              </label>

              <input
                type="text"
                name="last_name"
                value={
                  profile.last_name
                }
                onChange={handleChange}
                disabled={!editing}
                placeholder="Last name"
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-gray-300
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-[#202860]
                  disabled:bg-gray-100"
              />

            </div>

            {/* USERNAME */}
            <div>

              <label className="
                block
                text-sm
                font-semibold
                text-gray-700
                mb-2">
                Username
              </label>

              <input
                type="text"
                name="username"
                value={
                  profile.username
                }
                onChange={handleChange}
                disabled={!editing}
                placeholder="Username"
                className="
                  w-full
                  px-4
                  py-3
                  border
                  border-gray-300
                  rounded-lg
                  outline-none
                  focus:ring-2
                  focus:ring-[#202860]
                  disabled:bg-gray-100"
              />

            </div>

            {/* EMAIL */}
            <div>

              <label className="
                block
                text-sm
                font-semibold
                text-gray-700
                mb-2">
                Email Address
              </label>

              <div className="relative">

                <FaEnvelope
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  value={
                    profile.email
                  }
                  onChange={handleChange}
                  disabled={!editing}
                  placeholder="Email address"
                  className="
                    w-full
                    pl-11
                    pr-4
                    py-3
                    border
                    border-gray-300
                    rounded-lg
                    outline-none
                    focus:ring-2
                    focus:ring-[#202860]
                    disabled:bg-gray-100"
                />

              </div>
            </div>

          </div>

          {/* ==================================
              ACTION BUTTONS
          ================================== */}

          {editing && (
            <div className="
              flex
              justify-end
              gap-3
              mt-8
              pt-6
              border-t">

              <button
                type="button"
                onClick={handleCancel}
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
                <FaSave />

                {loading
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>
          )}

        </form>
      </div>

    </div>
  );
}