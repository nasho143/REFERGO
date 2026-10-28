import { useEffect, useMemo, useState } from "react";

import StatStrip from "../components/common/StatStrip";
import QuickFilterBar from "../components/common/QuickFilterBar";
import { readQuick, vacancyMatches } from "../utils/quickFilter";
import MiniCharts from "../components/common/MiniCharts";
import { countBy, countOverTime } from "../utils/chartData";
import { DEFAULT_PERIOD, periodFromParams, filterByPeriod } from "../utils/period";
import { useSearchParams } from "react-router-dom";
import VacancyToolbar from "../components/vacancies/VacancyToolbar";
import VacancyTable from "../components/vacancies/VacancyTable";
import VacancyModal from "../components/vacancies/VacancyModal";
import VacancyViewModal from "../components/vacancies/VacancyViewModal";

import ConfirmModal from "../components/common/ConfirmModal";

import {
  getVacancies,
  addVacancy,
  updateVacancy,
  deleteVacancy,
} from "../services/vacancyApi";

import { getEmployers } from "../services/employerApi";

import Swal from "sweetalert2";
import {
  approveVacancy,
  rejectVacancy,
} from "../services/approvalApi";

export default function Vacancies() {
  /* =========================================================
     USER / ROLE
  ========================================================= */

  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error reading logged-in user:", error);
      setUser(null);
    }
  }, []);

  const currentRole = String(user?.role || "").trim().toLowerCase();
  const isPesoStaff = currentRole === "peso_staff";
  const isDepartmentHead = currentRole === "department_head";

  /* =========================================================
     STATES
  ========================================================= */

  const [vacancies, setVacancies] = useState([]);
  const [employers, setEmployers] = useState([]);

  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const quick = useMemo(() => readQuick(searchParams), [searchParams]);
  const [period, setPeriod] = useState(() => periodFromParams(searchParams));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [editing, setEditing] = useState(false);

  const [selectedVacancy, setSelectedVacancy] = useState(null);
  const [deletingVacancy, setDeletingVacancy] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  /* =========================================================
     FORM
  ========================================================= */

  const [form, setForm] = useState({
    employer_id: "",
    position_title: "",
    qualifications: "",
    requirements: "",
    salary: "",
    location: "",
    employment_type: "Full-time",
    deadline: "",
    openings: 1,
    status: "Active",
  });

  /* =========================================================
     LOAD VACANCIES
  ========================================================= */

  const loadVacancies = async () => {
    try {
      setLoadingData(true);

      const res = await getVacancies();

      let vacancyList = [];

      if (Array.isArray(res)) {
        vacancyList = res;
      } else if (Array.isArray(res?.vacancies)) {
        vacancyList = res.vacancies;
      } else if (Array.isArray(res?.data)) {
        vacancyList = res.data;
      }

      setVacancies(vacancyList);
    } catch (error) {
      console.error("Error loading vacancies:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load job vacancies.",
      });
    } finally {
      setLoadingData(false);
    }
  };

  /* =========================================================
     LOAD EMPLOYERS
  ========================================================= */

  const loadEmployers = async () => {
    try {
      const res = await getEmployers();

      let employerList = [];

      if (Array.isArray(res)) {
        employerList = res;
      } else if (Array.isArray(res?.employers)) {
        employerList = res.employers;
      } else if (Array.isArray(res?.data)) {
        employerList = res.data;
      }

      setEmployers(employerList);
    } catch (error) {
      console.error("Error loading employers:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load employers.",
      });
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadVacancies();
    loadEmployers();
  }, []);

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     RESET FORM
  ========================================================= */

  const resetForm = () => {
    setForm({
      employer_id: "",
      position_title: "",
      qualifications: "",
      requirements: "",
      salary: "",
      location: "",
      employment_type: "Full-time",
      deadline: "",
      openings: 1,
      status: "Active",
    });
  };

  /* =========================================================
     ADD VACANCY
     PESO STAFF ONLY
  ========================================================= */

  const openAddModal = () => {
    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    resetForm();

    setEditing(false);
    setSelectedVacancy(null);

    setIsModalOpen(true);
  };

  /* =========================================================
     EDIT VACANCY
     PESO STAFF ONLY
  ========================================================= */

  const openEditModal = (vacancy) => {
    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    setEditing(true);
    setSelectedVacancy(vacancy);

    setForm({
      employer_id: vacancy.employer_id ?? "",

      position_title:
        vacancy.position_title ?? "",

      qualifications:
        vacancy.qualifications ?? "",

      requirements:
        vacancy.requirements ?? "",

      salary:
        vacancy.salary ?? "",

      location:
        vacancy.location ?? "",

      employment_type:
        vacancy.employment_type ?? "Full-time",

      deadline: vacancy.deadline
        ? String(vacancy.deadline).slice(0, 10)
        : "",

      openings:
        vacancy.openings ?? 1,

      status:
        vacancy.status ?? "Active",
    });

    setIsModalOpen(true);
  };

  /* =========================================================
     VIEW VACANCY
     BOTH ROLES
  ========================================================= */

  const openViewModal = (vacancy) => {
    setSelectedVacancy(vacancy);
    setIsViewModalOpen(true);
  };

  /* =========================================================
     DELETE MODAL
     PESO STAFF ONLY
  ========================================================= */

  const openDeleteModal = (vacancy) => {
    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    setDeletingVacancy(vacancy);
    setIsConfirmOpen(true);
  };

  /* =========================================================
     CLOSE ADD / EDIT MODAL
  ========================================================= */

  const closeModal = () => {
    if (loading) {
      return;
    }

    setIsModalOpen(false);
    setEditing(false);
    setSelectedVacancy(null);

    resetForm();
  };

  /* =========================================================
     CLOSE VIEW MODAL
  ========================================================= */

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedVacancy(null);
  };

  /* =========================================================
     CLOSE DELETE CONFIRMATION
  ========================================================= */

  const closeConfirmModal = () => {
    if (loading) {
      return;
    }

    setIsConfirmOpen(false);
    setDeletingVacancy(null);
  };

  /* =========================================================
     SAVE / UPDATE VACANCY
     PESO STAFF ONLY
  ========================================================= */

  const handleSubmit = async () => {
    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    /* ---------------------------------------------------------
       VALIDATION
    --------------------------------------------------------- */

    if (!form.employer_id) {
      Swal.fire({
        icon: "warning",
        title: "Employer Required",
        text: "Please select an employer.",
      });

      return;
    }

    if (!form.position_title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Position Required",
        text: "Please enter the position title.",
      });

      return;
    }

    if (!form.deadline) {
      Swal.fire({
        icon: "warning",
        title: "Deadline Required",
        text: "Please select a vacancy deadline.",
      });

      return;
    }

    if (!form.openings || Number(form.openings) < 1) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Openings",
        text: "Number of openings must be at least 1.",
      });

      return;
    }

    /* ---------------------------------------------------------
       SAVE
    --------------------------------------------------------- */

    try {
      setLoading(true);

      const vacancyData = {
        employer_id: Number(form.employer_id),

        position_title:
          form.position_title.trim(),

        qualifications:
          form.qualifications || "",

        requirements:
          form.requirements || "",

        salary:
          form.salary || "",

        location:
          form.location || "",

        employment_type:
          form.employment_type || "Full-time",

        deadline:
          form.deadline || null,

        openings:
          Number(form.openings),

        status:
          form.status || "Active",
      };

      /* -------------------------------------------------------
         UPDATE
      ------------------------------------------------------- */

      if (editing && selectedVacancy) {
        await updateVacancy(
          selectedVacancy.vacancy_id,
          vacancyData
        );

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Job vacancy has been updated successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      /* -------------------------------------------------------
         ADD
      ------------------------------------------------------- */

      else {
        await addVacancy(vacancyData);

        Swal.fire({
          icon: "success",
          title: "Added!",
          text: "Job vacancy has been added successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      }

      /* -------------------------------------------------------
         RESET
      ------------------------------------------------------- */

      setIsModalOpen(false);
      setEditing(false);
      setSelectedVacancy(null);

      resetForm();

      await loadVacancies();
    } catch (error) {
      console.error("Error saving vacancy:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Failed to save job vacancy.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     DELETE VACANCY
     PESO STAFF ONLY
  ========================================================= */

  const handleDelete = async () => {
    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    if (!deletingVacancy) {
      return;
    }

    try {
      setLoading(true);

      await deleteVacancy(
        deletingVacancy.vacancy_id
      );

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Job vacancy has been deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      setIsConfirmOpen(false);
      setDeletingVacancy(null);

      await loadVacancies();
    } catch (error) {
      console.error("Error deleting vacancy:", error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Failed to delete job vacancy.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredVacancies = filterByPeriod(
    vacancies,
    period,
    "created_at"
  )
    .filter((vacancy) => vacancyMatches(vacancy, quick))
    .filter(
    (vacancy) => {
      const keyword =
        search.toLowerCase().trim();

      if (!keyword) {
        return true;
      }

      return (
        String(
          vacancy.position_title || ""
        )
          .toLowerCase()
          .includes(keyword) ||

        String(
          vacancy.company_name || ""
        )
          .toLowerCase()
          .includes(keyword) ||

        String(
          vacancy.location || ""
        )
          .toLowerCase()
          .includes(keyword) ||

        String(
          vacancy.employment_type || ""
        )
          .toLowerCase()
          .includes(keyword)
      );
    }
  );

  /* =========================================================
     VACANCY STATUS
  ========================================================= */

  const getVacancyStatus = (vacancy) => {
    if (vacancy.status === "Closed") {
      return "Closed";
    }

    if (!vacancy.deadline) {
      return "Active";
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const deadline =
      new Date(vacancy.deadline);

    deadline.setHours(0, 0, 0, 0);

    const difference =
      (deadline - today) /
      (1000 * 60 * 60 * 24);

    if (difference < 0) {
      return "Expired";
    }

    if (difference <= 7) {
      return "Expiring Soon";
    }

    return "Active";
  };

  /* =========================================================
     SUMMARY CARDS
  ========================================================= */

  const periodVacancies = filterByPeriod(
    vacancies,
    period,
    "created_at"
  );

  const totalVacancies =
    periodVacancies.length;

  const activeVacancies =
    periodVacancies.filter(
      (vacancy) =>
        getVacancyStatus(vacancy) ===
        "Active"
    ).length;

  const expiringVacancies =
    periodVacancies.filter(
      (vacancy) =>
        getVacancyStatus(vacancy) ===
        "Expiring Soon"
    ).length;

  const expiredVacancies =
    periodVacancies.filter(
      (vacancy) =>
        getVacancyStatus(vacancy) ===
        "Expired"
    ).length;


  // ==========================================================
  // DEPARTMENT HEAD APPROVAL
  // ==========================================================

  const handleApprove = async (vacancy) => {
    if (!isDepartmentHead || !vacancy?.vacancy_id) return;

    const result = await Swal.fire({
      icon: "question",
      title: "Approve Job Vacancy?",
      text: `Approve ${vacancy.position_title || "this vacancy"}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#1e6b3c",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await approveVacancy(vacancy.vacancy_id);
      await loadVacancies();

      await Swal.fire({
        icon: "success",
        title: "Approved",
        text: "Job vacancy has been approved.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("APPROVE VACANCY ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text:
          error?.response?.data?.message ||
          "Failed to approve job vacancy.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (vacancy) => {
    if (!isDepartmentHead || !vacancy?.vacancy_id) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Reject Job Vacancy",
      input: "textarea",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Enter the reason...",
      showCancelButton: true,
      confirmButtonText: "Reject Vacancy",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#c8142f",
      inputValidator: (value) =>
        !value || !value.trim()
          ? "Rejection reason is required."
          : undefined,
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await rejectVacancy(
        vacancy.vacancy_id,
        result.value.trim()
      );
      await loadVacancies();

      await Swal.fire({
        icon: "success",
        title: "Rejected",
        text: "Job vacancy has been rejected.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("REJECT VACANCY ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Rejection Failed",
        text:
          error?.response?.data?.message ||
          "Failed to reject job vacancy.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER + SEARCH
      ====================================================== */}

      <QuickFilterBar />

      <VacancyToolbar
        search={search}
        setSearch={setSearch}
        period={period}
        setPeriod={setPeriod}
        totalVacancies={
          filteredVacancies.length
        }
        onAdd={
          (isPesoStaff || isDepartmentHead) ? openAddModal : null
        }
      />

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <MiniCharts
        loading={loadingData}
        charts={[
          {
            title: "Vacancies by status",
            type: "donut",
            data: countBy(periodVacancies, getVacancyStatus),
          },
          {
            title: "Employment type",
            type: "bar",
            data: countBy(
              periodVacancies,
              (v) => v.employment_type
            ),
          },
          {
            title: "Openings by employer (top 5)",
            type: "bar",
            data: Object.entries(
              periodVacancies.reduce((acc, v) => {
                const name = v.company_name || "Not specified";
                acc[name] =
                  (acc[name] || 0) + (Number(v.openings) || 0);
                return acc;
              }, {})
            )
              .map(([name, value]) => ({ name, value }))
              .sort((a, b) => b.value - a.value)
              .slice(0, 5),
          },
          {
            title: "Approval status",
            type: "donut",
            data: countBy(
              periodVacancies,
              (v) => v.approval_status,
              { fallback: "Pending" }
            ),
          },
          {
            title: "Vacancies posted",
            type: "line",
            data: countOverTime(
              periodVacancies,
              (v) => v.created_at,
              period.mode
            ),
            series: [
              { key: "value", name: "Posted", color: "#202860" },
            ],
          },
        ]}
      />

      <StatStrip
        items={[
          { label: "Total Vacancies", value: totalVacancies },
          { label: "Active", value: activeVacancies },
          { label: "Expiring Soon", value: expiringVacancies },
          { label: "Expired", value: expiredVacancies },
        ]}
      />

      {/* =====================================================
          VACANCY TABLE
      ====================================================== */}

      <VacancyTable
        vacancies={
          filteredVacancies
        }
        loading={loadingData}
        onView={
          openViewModal
        }
        onEdit={
          (isPesoStaff || isDepartmentHead) ? openEditModal : null
        }
        onDelete={
          (isPesoStaff || isDepartmentHead) ? openDeleteModal : null
        }
        onApprove={isDepartmentHead ? handleApprove : null}
        onReject={isDepartmentHead ? handleReject : null}
      />

      {/* =====================================================
          ADD / EDIT MODAL
          PESO STAFF ONLY
      ====================================================== */}

      {(isPesoStaff || isDepartmentHead) && (
        <VacancyModal
          isOpen={isModalOpen}
          onClose={closeModal}

          /* IMPORTANT:
             VacancyModal expects editingVacancy,
             not editing.
          */
          editingVacancy={
            editing
              ? selectedVacancy
              : null
          }

          form={form}
          employers={employers}

          /* IMPORTANT:
             VacancyModal expects onChange,
             not handleChange.
          */
          onChange={handleChange}

          /* IMPORTANT:
             VacancyModal expects onSubmit,
             not handleSubmit.
          */
          onSubmit={handleSubmit}

          /* IMPORTANT:
             VacancyModal expects submitting,
             not loading.
          */
          submitting={loading}
        />
      )}

      {/* =====================================================
          VIEW MODAL
          BOTH ROLES
      ====================================================== */}

      {selectedVacancy && (
        <VacancyViewModal
          isOpen={
            isViewModalOpen
          }
          onClose={
            closeViewModal
          }
          vacancy={
            selectedVacancy
          }
        />
      )}

      {/* =====================================================
          DELETE CONFIRMATION
          PESO STAFF ONLY
      ====================================================== */}

      {(isPesoStaff || isDepartmentHead) && (
        <ConfirmModal
          isOpen={
            isConfirmOpen
          }
          onClose={
            closeConfirmModal
          }
          onConfirm={
            handleDelete
          }
          title="Delete Job Vacancy"
          message={
            deletingVacancy
              ? `Are you sure you want to delete "${deletingVacancy.position_title}"?`
              : "Are you sure you want to delete this job vacancy?"
          }
          loading={
            loading
          }
        />
      )}

    </div>
  );
}