import { useEffect, useMemo, useState } from "react";

import {
  FaBuilding,
  FaCheckCircle,
  FaBriefcase,
  FaUsers,
} from "react-icons/fa";

import {
  getEmployers,
  addEmployer,
  updateEmployer,
  deleteEmployer,
} from "../services/employerApi";

import { getVacancies } from "../services/vacancyApi";

import EmployerToolbar from "../components/employers/EmployerToolbar";
import EmployerTable from "../components/employers/EmployerTable";
import EmployerModal from "../components/employers/EmployerModal";
import EmployerViewModal from "../components/employers/EmployerViewModal";

import ConfirmModal from "../components/common/ConfirmModal";
import Swal from "sweetalert2";

import {
  approveEmployer,
  rejectEmployer,
} from "../services/approvalApi";

export default function Employers() {

  // =========================================================
  // USER ROLE
  // =========================================================

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error("INVALID USER DATA:", error);
    user = null;
  }

  const currentRole = String(user?.role || "").trim().toLowerCase();

  const isPesoStaff =
    currentRole === "peso_staff";

  const isDepartmentHead =
    currentRole === "department_head";


  // =========================================================
  // STATE
  // =========================================================

  const [employers, setEmployers] = useState([]);
  const [vacancies, setVacancies] = useState([]);

  const [loading, setLoading] = useState(false);
  const [vacancyLoading, setVacancyLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editing, setEditing] = useState(false);

  const [selectedEmployer, setSelectedEmployer] = useState(null);

  const [form, setForm] = useState({
    employer_id: "",
    company_name: "",
    contact_person: "",
    contact_number: "",
    email: "",
    address: "",
    reapply_cooldown_days: 90,
  });


  // =========================================================
  // LOAD EMPLOYERS
  // =========================================================

  async function loadEmployers() {

    try {

      setLoading(true);

      const data = await getEmployers();

      console.log("EMPLOYERS RESPONSE:", data);

      let employerList = [];

      if (Array.isArray(data)) {

        employerList = data;

      } else if (Array.isArray(data?.data)) {

        employerList = data.data;

      } else if (Array.isArray(data?.employers)) {

        employerList = data.employers;

      } else if (Array.isArray(data?.data?.employers)) {

        employerList = data.data.employers;

      }

      setEmployers(employerList);

    } catch (err) {

      console.error(
        "LOAD EMPLOYERS ERROR:",
        err
      );

      setEmployers([]);

    } finally {

      setLoading(false);

    }

  }


  // =========================================================
  // LOAD VACANCIES
  // =========================================================

  async function loadVacancies() {

    try {

      setVacancyLoading(true);

      const data = await getVacancies();

      console.log("VACANCIES RESPONSE:", data);

      let vacancyList = [];

      if (Array.isArray(data)) {

        vacancyList = data;

      } else if (Array.isArray(data?.data)) {

        vacancyList = data.data;

      } else if (Array.isArray(data?.vacancies)) {

        vacancyList = data.vacancies;

      } else if (
        Array.isArray(data?.data?.vacancies)
      ) {

        vacancyList = data.data.vacancies;

      }

      setVacancies(vacancyList);

    } catch (err) {

      console.error(
        "LOAD VACANCIES ERROR:",
        err
      );

      setVacancies([]);

    } finally {

      setVacancyLoading(false);

    }

  }


  // =========================================================
  // LOAD DATA WHEN PAGE OPENS
  // =========================================================

  useEffect(() => {

    loadEmployers();
    loadVacancies();

  }, []);


  // =========================================================
  // SEARCH / FILTER EMPLOYERS
  // =========================================================

  const filteredEmployers = useMemo(() => {

    if (!Array.isArray(employers)) {
      return [];
    }

    const searchValue =
      search
        .toLowerCase()
        .trim();

    if (!searchValue) {
      return employers;
    }

    return employers.filter(
      (employer) => {

        return (

          employer?.company_name
            ?.toLowerCase()
            .includes(searchValue)

          ||

          employer?.contact_person
            ?.toLowerCase()
            .includes(searchValue)

          ||

          employer?.contact_number
            ?.toLowerCase()
            .includes(searchValue)

          ||

          employer?.email
            ?.toLowerCase()
            .includes(searchValue)

          ||

          employer?.address
            ?.toLowerCase()
            .includes(searchValue)

        );

      }
    );

  }, [employers, search]);


  // =========================================================
  // SUMMARY CARD VALUES
  // =========================================================

  const totalEmployers =
    employers.length;

  const activeEmployers =
    employers.length;

  const totalVacancies =
    vacancies.length;


  // =========================================================
  // EMPLOYERS WITH OPENINGS
  // =========================================================

  const employersWithOpenings =
    useMemo(() => {

      const employerIds =
        new Set();

      vacancies.forEach(
        (vacancy) => {

          const status =
            String(
              vacancy?.status ||
              "Active"
            )
              .trim()
              .toLowerCase();

          let isActive =
            status === "active";


          // ---------------------------------------------------
          // CHECK VACANCY DEADLINE
          // ---------------------------------------------------

          if (vacancy?.deadline) {

            const today =
              new Date();

            today.setHours(
              0,
              0,
              0,
              0
            );

            const deadlineDate =
              new Date(
                `${vacancy.deadline}T00:00:00`
              );

            if (
              deadlineDate < today
            ) {

              isActive = false;

            }

          }


          // ---------------------------------------------------
          // ADD EMPLOYER
          // ---------------------------------------------------

          if (
            isActive &&
            vacancy?.employer_id
          ) {

            employerIds.add(
              Number(
                vacancy.employer_id
              )
            );

          }

        }
      );

      return employerIds.size;

    }, [vacancies]);


  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setForm(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );

  };


  // =========================================================
  // RESET FORM
  // =========================================================

  const resetForm = () => {

    setForm({
      employer_id: "",
      company_name: "",
      contact_person: "",
      contact_number: "",
      email: "",
      address: "",
      reapply_cooldown_days: 90,
    });

  };


  // =========================================================
  // OPEN ADD MODAL
  // PESO STAFF ONLY
  // =========================================================

  const openAddModal = () => {

    // Department Head cannot add
    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    setEditing(false);

    resetForm();

    setShowModal(true);

  };


  // =========================================================
  // OPEN EDIT MODAL
  // PESO STAFF ONLY
  // =========================================================

  const openEditModal = (
    employer
  ) => {

    // Department Head cannot edit
    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    if (!employer) {
      return;
    }

    setEditing(true);

    setForm({

      employer_id:
        employer.employer_id ||
        "",

      company_name:
        employer.company_name ||
        "",

      contact_person:
        employer.contact_person ||
        "",

      contact_number:
        employer.contact_number ||
        "",

      email:
        employer.email ||
        "",

      address:
        employer.address ||
        "",

      reapply_cooldown_days:
        employer.reapply_cooldown_days ??
        90,

    });

    setShowModal(true);

  };


  // =========================================================
  // OPEN VIEW MODAL
  // BOTH ROLES
  // =========================================================

  const openViewModal = (
    employer
  ) => {

    if (!employer) {
      return;
    }

    setSelectedEmployer(
      employer
    );

    setShowViewModal(true);

  };


  // =========================================================
  // OPEN DELETE MODAL
  // PESO STAFF ONLY
  // =========================================================

  const openDeleteModal = (
    employer
  ) => {

    // Department Head cannot delete
    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    if (!employer) {
      return;
    }

    setSelectedEmployer(
      employer
    );

    setShowDeleteModal(true);

  };


  // =========================================================
  // ADD / UPDATE EMPLOYER
  // PESO STAFF ONLY
  // =========================================================

  const handleSubmit =
    async () => {

      // Department Head cannot save
      if (!isPesoStaff && !isDepartmentHead) {
        return;
      }

      try {

        setLoading(true);

        const employerData = {

          company_name:
            form.company_name
              ?.trim() || "",

          contact_person:
            form.contact_person
              ?.trim() || "",

          contact_number:
            form.contact_number
              ?.trim() || "",

          email:
            form.email
              ?.trim() || "",

          address:
            form.address
              ?.trim() || "",

          reapply_cooldown_days:
            Number(
              form.reapply_cooldown_days
            ) || 90,

        };


        // ---------------------------------------------------
        // UPDATE
        // ---------------------------------------------------

        if (editing) {

          await updateEmployer(
            form.employer_id,
            employerData
          );

        }


        // ---------------------------------------------------
        // ADD
        // ---------------------------------------------------

        else {

          await addEmployer(
            employerData
          );

        }


        setShowModal(false);

        resetForm();

        await loadEmployers();

      } catch (err) {

        console.error(
          "SAVE EMPLOYER ERROR:",
          err
        );

      } finally {

        setLoading(false);

      }

    };


  // =========================================================
  // DELETE EMPLOYER
  // PESO STAFF ONLY
  // =========================================================

  const handleDelete =
    async () => {

      // Department Head cannot delete
      if (!isPesoStaff && !isDepartmentHead) {
        return;
      }

      if (
        !selectedEmployer
          ?.employer_id
      ) {

        return;

      }

      try {

        setLoading(true);

        await deleteEmployer(
          selectedEmployer.employer_id
        );


        setShowDeleteModal(false);

        setSelectedEmployer(
          null
        );


        await loadEmployers();

        await loadVacancies();

      } catch (err) {

        console.error(
          "DELETE EMPLOYER ERROR:",
          err
        );

      } finally {

        setLoading(false);

      }

    };


  // =========================================================

  // ==========================================================
  // DEPARTMENT HEAD APPROVAL
  // ==========================================================

  const handleApprove = async (employer) => {
    if (!isDepartmentHead || !employer?.employer_id) return;

    const result = await Swal.fire({
      icon: "question",
      title: "Approve Employer?",
      text: `Approve ${employer.company_name || "this employer"}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await approveEmployer(employer.employer_id);
      await loadEmployers();

      await Swal.fire({
        icon: "success",
        title: "Approved",
        text: "Employer has been approved.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("APPROVE EMPLOYER ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text:
          error?.response?.data?.message ||
          "Failed to approve employer.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (employer) => {
    if (!isDepartmentHead || !employer?.employer_id) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Reject Employer",
      input: "textarea",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Enter the reason...",
      showCancelButton: true,
      confirmButtonText: "Reject Employer",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      inputValidator: (value) =>
        !value || !value.trim()
          ? "Rejection reason is required."
          : undefined,
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await rejectEmployer(
        employer.employer_id,
        result.value.trim()
      );
      await loadEmployers();

      await Swal.fire({
        icon: "success",
        title: "Rejected",
        text: "Employer has been rejected.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("REJECT EMPLOYER ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Rejection Failed",
        text:
          error?.response?.data?.message ||
          "Failed to reject employer.",
      });
    } finally {
      setLoading(false);
    }
  };

  // RENDER
  // =========================================================

  return (

    <div className="space-y-6">

      {/* =====================================================
          EMPLOYER TOOLBAR
      ====================================================== */}

      <EmployerToolbar
        search={search}
        setSearch={setSearch}

        /*
          Add button is only available
          to PESO Staff.
        */
        onAdd={
          (isPesoStaff || isDepartmentHead) ? openAddModal : null
        }
        onApprove={isDepartmentHead ? handleApprove : null}
        onReject={isDepartmentHead ? handleReject : null}

        totalEmployers={
          totalEmployers
        }
      />


      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">


        {/* ===================================================
            TOTAL EMPLOYERS
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Employers
              </p>

              <h3 className="mt-2 text-3xl font-bold text-slate-800">
                {totalEmployers}
              </h3>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FaBuilding />
            </div>

          </div>

        </div>


        {/* ===================================================
            ACTIVE EMPLOYERS
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Active Employers
              </p>

              <h3 className="mt-2 text-3xl font-bold text-green-600">
                {activeEmployers}
              </h3>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FaCheckCircle />
            </div>

          </div>

        </div>


        {/* ===================================================
            TOTAL VACANCIES
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total Vacancies
              </p>

              <h3 className="mt-2 text-3xl font-bold text-indigo-600">
                {totalVacancies}
              </h3>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FaBriefcase />
            </div>

          </div>

        </div>


        {/* ===================================================
            EMPLOYERS WITH OPENINGS
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Employers with Openings
              </p>

              <h3 className="mt-2 text-3xl font-bold text-amber-600">
                {employersWithOpenings}
              </h3>

            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FaUsers />
            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          EMPLOYER TABLE
      ====================================================== */}

      <EmployerTable
        employers={
          filteredEmployers
        }

        loading={
          loading ||
          vacancyLoading
        }

        /*
          Both roles can VIEW.
        */
        onView={
          openViewModal
        }

        /*
          Only PESO Staff can EDIT.
        */
        onEdit={
          (isPesoStaff || isDepartmentHead) ? openEditModal : null
        }

        /*
          Only PESO Staff can DELETE.
        */
        onDelete={
          (isPesoStaff || isDepartmentHead) ? openDeleteModal : null
        }

        /*
          Add inside table is also
          only for PESO Staff.
        */
        onAdd={
          (isPesoStaff || isDepartmentHead) ? openAddModal : null
        }

        onApprove={
          isDepartmentHead ? handleApprove : null
        }

        onReject={
          isDepartmentHead ? handleReject : null
        }
      />


      {/* =====================================================
          ADD / EDIT EMPLOYER MODAL
      ====================================================== */}

      {(isPesoStaff || isDepartmentHead) && (

        <EmployerModal
          isOpen={
            showModal
          }

          onClose={() => {

            if (loading) {
              return;
            }

            setShowModal(
              false
            );

            resetForm();

          }}

          editing={
            editing
          }

          form={
            form
          }

          handleChange={
            handleChange
          }

          handleSubmit={
            handleSubmit
          }

          loading={
            loading
          }
        />

      )}


      {/* =====================================================
          VIEW EMPLOYER MODAL
          BOTH ROLES
      ====================================================== */}

      <EmployerViewModal

        isOpen={
          showViewModal
        }

        onClose={() => {

          setShowViewModal(
            false
          );

          setSelectedEmployer(
            null
          );

        }}

        employer={
          selectedEmployer
        }

      />


      {/* =====================================================
          DELETE CONFIRMATION
          PESO STAFF ONLY
      ====================================================== */}

      {(isPesoStaff || isDepartmentHead) && (

        <ConfirmModal

          isOpen={
            showDeleteModal
          }

          onClose={() => {

            setShowDeleteModal(
              false
            );

            setSelectedEmployer(
              null
            );

          }}

          onConfirm={
            handleDelete
          }

          loading={
            loading
          }

          title="Delete Employer"

          message={`Are you sure you want to delete "${
            selectedEmployer?.company_name ||
            "this employer"
          }"? This action cannot be undone.`}

          confirmText="Delete Employer"

          variant="danger"

        />

      )}

    </div>

  );

}