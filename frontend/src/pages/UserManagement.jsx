import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import {
  getUsers,
  addUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} from "../services/userApi";

import UserToolbar from "../components/users/UserToolbar";
import UserSummaryCards from "../components/users/UserSummaryCards";
import UserTable from "../components/users/UserTable";
import UserModal from "../components/users/UserModal";

const initialForm = {
  full_name: "",
  username: "",
  email: "",
  password: "",
  role: "peso_staff",
  status: "active",
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState(initialForm);

  // =========================================================
  // LOAD USERS
  // =========================================================

  async function loadUsers() {
    try {
      setLoading(true);

      const res = await getUsers();

      const userList = res?.data?.users || [];

      setUsers(Array.isArray(userList) ? userList : []);
    } catch (error) {
      console.error("LOAD USERS ERROR:", error);
      console.error("LOAD USERS RESPONSE:", error?.response?.data);

      Swal.fire({
        icon: "error",
        title: "Failed to Load Users",
        text:
          error?.response?.data?.message ||
          "Unable to retrieve system users.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter((user) => {
      const fullName = String(user.full_name || "").toLowerCase();
      const username = String(user.username || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const role = String(user.role || "").toLowerCase();
      const status = String(user.status || "").toLowerCase();

      return (
        fullName.includes(keyword) ||
        username.includes(keyword) ||
        email.includes(keyword) ||
        role.includes(keyword) ||
        status.includes(keyword)
      );
    });
  }, [users, search]);

  // =========================================================
  // OPEN ADD MODAL
  // =========================================================

  function handleAddUser() {
    setEditingUser(null);
    setForm(initialForm);
    setShowModal(true);
  }

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  function handleEditUser(user) {
    setEditingUser(user);

    setForm({
      full_name: user.full_name || "",
      username: user.username || "",
      email: user.email || "",
      password: "",
      role: user.role || "peso_staff",
      status: user.status || "active",
    });

    setShowModal(true);
  }

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  function handleCloseModal() {
    if (saving) return;

    setShowModal(false);
    setEditingUser(null);
    setForm(initialForm);
  }

  // =========================================================
  // SUBMIT ADD / EDIT
  // =========================================================

  async function handleSubmit(e) {
    e.preventDefault();

    const fullName = form.full_name.trim();
    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password.trim();

    if (!fullName) {
      Swal.fire({
        icon: "warning",
        title: "Full Name Required",
        text: "Please enter the user's full name.",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    if (!username) {
      Swal.fire({
        icon: "warning",
        title: "Username Required",
        text: "Please enter a username.",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    if (!editingUser && !password) {
      Swal.fire({
        icon: "warning",
        title: "Password Required",
        text: "Please enter a password for the new user.",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    try {
      setSaving(true);

      if (editingUser) {
        const payload = {
          full_name: fullName,
          username,
          email: email || null,
          role: form.role,
          status: form.status,
        };

        // Only send password when changing it.
        if (password) {
          payload.password = password;
        }

        await updateUser(editingUser.id, payload);

        await Swal.fire({
          icon: "success",
          title: "User Updated",
          text: "The user account has been updated successfully.",
          confirmButtonColor: "#2563eb",
        });
      } else {
        const payload = {
          full_name: fullName,
          username,
          email: email || null,
          password,
          role: form.role,
          status: form.status,
        };

        await addUser(payload);

        await Swal.fire({
          icon: "success",
          title: "User Created",
          text: "The new user account has been created successfully.",
          confirmButtonColor: "#2563eb",
        });
      }

      setShowModal(false);
      setEditingUser(null);
      setForm(initialForm);

      await loadUsers();
    } catch (error) {
      console.error("SAVE USER ERROR:", error);
      console.error("SAVE USER RESPONSE:", error?.response?.data);

      Swal.fire({
        icon: "error",
        title: editingUser
          ? "Failed to Update User"
          : "Failed to Create User",
        text:
          error?.response?.data?.message ||
          "Something went wrong while saving the user.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // TOGGLE USER STATUS
  // =========================================================

  async function handleToggleStatus(user) {
    const isActive = user.status === "active";

    const result = await Swal.fire({
      icon: isActive ? "warning" : "question",
      title: isActive
        ? "Deactivate User?"
        : "Activate User?",
      html: `
        <p>
          Are you sure you want to ${
            isActive ? "deactivate" : "activate"
          }
          <strong>${user.full_name || "this user"}</strong>?
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: isActive
        ? "Yes, Deactivate"
        : "Yes, Activate",
      cancelButtonText: "Cancel",
      confirmButtonColor: isActive ? "#d97706" : "#16a34a",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await toggleUserStatus(user.id);

      await Swal.fire({
        icon: "success",
        title: isActive
          ? "User Deactivated"
          : "User Activated",
        text: `${user.full_name} is now ${
          isActive ? "inactive" : "active"
        }.`,
        confirmButtonColor: "#2563eb",
      });

      await loadUsers();
    } catch (error) {
      console.error("TOGGLE USER STATUS ERROR:", error);
      console.error(
        "TOGGLE USER STATUS RESPONSE:",
        error?.response?.data
      );

      Swal.fire({
        icon: "error",
        title: "Action Failed",
        text:
          error?.response?.data?.message ||
          "Unable to change the user's status.",
        confirmButtonColor: "#2563eb",
      });
    }
  }

  // =========================================================
  // DELETE USER
  // =========================================================

  async function handleDeleteUser(user) {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete User?",
      html: `
        <p>
          You are about to permanently delete
          <strong>${user.full_name || "this user"}</strong>.
        </p>
        <p class="mt-2 text-sm">
          This action cannot be undone.
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteUser(user.id);

      await Swal.fire({
        icon: "success",
        title: "User Deleted",
        text: "The user account has been deleted successfully.",
        confirmButtonColor: "#2563eb",
      });

      await loadUsers();
    } catch (error) {
      console.error("DELETE USER ERROR:", error);
      console.error(
        "DELETE USER RESPONSE:",
        error?.response?.data
      );

      Swal.fire({
        icon: "error",
        title: "Failed to Delete User",
        text:
          error?.response?.data?.message ||
          "Unable to delete the user account.",
        confirmButtonColor: "#2563eb",
      });
    }
  }

  // =========================================================
  // HELPERS
  // =========================================================

  function getRoleLabel(role) {
    if (role === "department_head") {
      return "Department Head";
    }

    if (role === "peso_staff") {
      return "PESO Staff";
    }

    return role || "Unknown";
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">
      <UserToolbar
        search={search}
        setSearch={setSearch}
        totalUsers={users.length}
        onAddUser={handleAddUser}
      />

      <UserSummaryCards users={users} />

      <UserTable
        users={filteredUsers}
        loading={loading}
        onEdit={handleEditUser}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeleteUser}
        formatDate={formatDate}
        getRoleLabel={getRoleLabel}
      />

      <UserModal
        show={showModal}
        editingUser={editingUser}
        form={form}
        setForm={setForm}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        loading={saving}
      />
    </div>
  );
}