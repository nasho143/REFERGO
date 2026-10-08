import { useEffect, useMemo, useState } from "react";
import {
  FaExchangeAlt,
  FaClock,
  FaCalendarCheck,
  FaCheckCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";

import ReferralToolbar from "../components/referrals/ReferralToolbar";
import ReferralTable from "../components/referrals/ReferralTable";
import ReferralModal from "../components/referrals/ReferralModal";
import ReferralViewModal from "../components/referrals/ReferralViewModal";

import {
  getReferrals,
  addReferral,
  updateReferral,
  deleteReferral,
} from "../services/referralApi";

import { getApplicants } from "../services/applicantApi";
import { getVacancies } from "../services/vacancyApi";

import {
  approveReferral,
  rejectReferral,
} from "../services/approvalApi";

export default function Referrals() {
  /* =========================================================
     USER / RBAC
  ========================================================= */

  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("FAILED TO READ USER:", error);
      setUser(null);
    }
  }, []);

  const currentRole = String(user?.role || "").trim().toLowerCase();
  const isPesoStaff = currentRole === "peso_staff";
  const isDepartmentHead = currentRole === "department_head";

  /* =========================================================
     STATE
  ========================================================= */

  const [referrals, setReferrals] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [vacancies, setVacancies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [editing, setEditing] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  /* =========================================================
     FORM
  ========================================================= */

  const emptyForm = {
    applicant_id: "",
    vacancy_id: "",
    status: "Pending",

    date_referred: "",
    interview_date: "",
    result: "",

    rejection_reason: "",

    date_contacted: "",
    contacted_person: "",
    contact_method: "",
    follow_up_result: "",
    next_follow_up: "",

    // Automatically calculated by backend.
    // Kept here so edit/view state stays consistent.
    reapply_eligible_date: "",
  };

  const [form, setForm] = useState(emptyForm);

  /* =========================================================
     EXTRACT ARRAY
  ========================================================= */

  const extractArray = (response, keys = []) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.referrals)) {
      return response.referrals;
    }

    if (Array.isArray(response?.applicants)) {
      return response.applicants;
    }

    if (Array.isArray(response?.vacancies)) {
      return response.vacancies;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.data?.referrals)) {
      return response.data.referrals;
    }

    if (Array.isArray(response?.data?.applicants)) {
      return response.data.applicants;
    }

    if (Array.isArray(response?.data?.vacancies)) {
      return response.data.vacancies;
    }

    for (const key of keys) {
      if (Array.isArray(response?.[key])) {
        return response[key];
      }

      if (Array.isArray(response?.data?.[key])) {
        return response.data[key];
      }
    }

    return [];
  };

  /* =========================================================
     LOAD REFERRALS
  ========================================================= */

  const loadReferrals = async () => {
    try {
      setLoading(true);

      const response = await getReferrals();

      console.log("GET REFERRALS RAW RESPONSE:", response);

      const normalized = extractArray(response, ["referrals"]);

      console.log("NORMALIZED REFERRALS:", normalized);
      console.log("REFERRAL COUNT:", normalized.length);

      setReferrals(normalized);
    } catch (error) {
      console.error("LOAD REFERRALS ERROR:", error);

      setReferrals([]);

      Swal.fire({
        icon: "error",
        title: "Failed to Load Referrals",
        text:
          error?.response?.data?.message ||
          "Unable to load referral records.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     LOAD APPLICANTS
  ========================================================= */

  const loadApplicants = async () => {
    try {
      const response = await getApplicants();

      console.log("GET APPLICANTS RAW RESPONSE:", response);

      const normalized = extractArray(response, ["applicants"]);

      console.log("NORMALIZED APPLICANTS:", normalized);

      setApplicants(normalized);
    } catch (error) {
      console.error("LOAD APPLICANTS ERROR:", error);

      setApplicants([]);
    }
  };

  /* =========================================================
     LOAD VACANCIES
  ========================================================= */

  const loadVacancies = async () => {
    try {
      const response = await getVacancies();

      console.log("GET VACANCIES RAW RESPONSE:", response);

      const normalized = extractArray(response, ["vacancies"]);

      console.log("NORMALIZED VACANCIES:", normalized);

      setVacancies(normalized);
    } catch (error) {
      console.error("LOAD VACANCIES ERROR:", error);

      setVacancies([]);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadReferrals();
    loadApplicants();
    loadVacancies();
  }, []);

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredReferrals = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return referrals;
    }

    return referrals.filter((referral) => {
      const searchableText = [
        referral.full_name,
        referral.company_name,
        referral.position_title,
        referral.status,
        referral.result,
        referral.rejection_reason,
        referral.classification,
        referral.contact_person,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [referrals, search]);

  /* =========================================================
     SUMMARY COUNTS
  ========================================================= */

  const totalReferrals = referrals.length;

  const pendingReferrals = referrals.filter(
    (referral) =>
      String(referral.status || "").trim() === "Pending"
  ).length;

  const interviewReferrals = referrals.filter((referral) => {
    const status = String(referral.status || "").trim();

    return (
      status === "For Interview" ||
      status === "Interview Scheduled"
    );
  }).length;

  const hiredReferrals = referrals.filter(
    (referral) =>
      String(referral.status || "").trim() === "Hired"
  ).length;

  /* =========================================================
     ADD
  ========================================================= */

  const handleAdd = () => {
    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    setEditing(false);
    setSelectedReferral(null);

    setForm({
      ...emptyForm,
      date_referred: new Date()
        .toISOString()
        .split("T")[0],
    });

    setIsModalOpen(true);
  };

  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = (referral) => {
    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    setEditing(true);
    setSelectedReferral(referral);

    setForm({
      applicant_id: referral.applicant_id ?? "",
      vacancy_id: referral.vacancy_id ?? "",
      status: referral.status ?? "Pending",

      date_referred: referral.date_referred
        ? String(referral.date_referred).substring(0, 10)
        : "",

      interview_date: referral.interview_date
        ? String(referral.interview_date).substring(0, 10)
        : "",

      result: referral.result ?? "",

      rejection_reason:
        referral.rejection_reason ?? "",

      date_contacted: referral.date_contacted
        ? String(referral.date_contacted).substring(0, 10)
        : "",

      contacted_person:
        referral.contacted_person ?? "",

      contact_method:
        referral.contact_method ?? "",

      follow_up_result:
        referral.follow_up_result ?? "",

      next_follow_up: referral.next_follow_up
        ? String(referral.next_follow_up).substring(0, 10)
        : "",

      reapply_eligible_date:
        referral.reapply_eligible_date
          ? String(referral.reapply_eligible_date).substring(0, 10)
          : "",
    });

    setIsModalOpen(true);
  };

  /* =========================================================
     VIEW
  ========================================================= */

  const handleView = (referral) => {
    setSelectedReferral(referral);
    setIsViewModalOpen(true);
  };

  /* =========================================================
     CLOSE ADD / EDIT
  ========================================================= */

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setIsModalOpen(false);
    setEditing(false);
    setForm(emptyForm);
    setSelectedReferral(null);
  };

  /* =========================================================
     CLOSE VIEW
  ========================================================= */

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedReferral(null);
  };

  /* =========================================================
     FORMAT DATE FOR WARNING
  ========================================================= */

  const formatDisplayDate = (value) => {
    if (!value) {
      return "-";
    }

    const dateString = String(value).substring(0, 10);
    const parts = dateString.split("-");

    if (parts.length !== 3) {
      return dateString;
    }

    const [year, month, day] = parts;

    return `${month}/${day}/${year}`;
  };

  /* =========================================================
     FIND SELECTED VACANCY
  ========================================================= */

  const selectedVacancy = useMemo(() => {
    if (!form.vacancy_id) {
      return null;
    }

    return (
      vacancies.find(
        (vacancy) =>
          Number(vacancy.vacancy_id) ===
          Number(form.vacancy_id)
      ) || null
    );
  }, [vacancies, form.vacancy_id]);

  /* =========================================================
     FIND SELECTED APPLICANT
  ========================================================= */

  const selectedApplicant = useMemo(() => {
    if (!form.applicant_id) {
      return null;
    }

    return (
      applicants.find(
        (applicant) =>
          Number(applicant.applicant_id) ===
          Number(form.applicant_id)
      ) || null
    );
  }, [applicants, form.applicant_id]);

  /* =========================================================
     DUPLICATE ACTIVE REFERRAL CHECK
  ========================================================= */

  const findDuplicateActiveReferral = () => {
    if (!form.applicant_id || !form.vacancy_id) {
      return null;
    }

    const activeStatuses = [
      "Pending",
      "For Interview",
      "Interview Scheduled",
      "Hired",
      "No Response",
    ];

    const duplicate = referrals.find((referral) => {
      const sameApplicant =
        Number(referral.applicant_id) ===
        Number(form.applicant_id);

      const sameVacancy =
        Number(referral.vacancy_id) ===
        Number(form.vacancy_id);

      const isActiveStatus = activeStatuses.includes(
        String(referral.status || "").trim()
      );

      const isCurrentReferral =
        editing &&
        selectedReferral &&
        Number(referral.referral_id) ===
          Number(selectedReferral.referral_id);

      return (
        sameApplicant &&
        sameVacancy &&
        isActiveStatus &&
        !isCurrentReferral
      );
    });

    return duplicate || null;
  };

  /* =========================================================
     EMPLOYER REAPPLICATION COOLDOWN CHECK
  ========================================================= */

  const findEmployerCooldown = () => {
    if (
      !form.applicant_id ||
      !selectedVacancy?.employer_id ||
      !form.date_referred
    ) {
      return null;
    }

    const employerId = Number(
      selectedVacancy.employer_id
    );

    const currentReferralId =
      editing && selectedReferral
        ? Number(selectedReferral.referral_id)
        : null;

    const cooldownReferrals = referrals.filter(
      (referral) => {
        const sameApplicant =
          Number(referral.applicant_id) ===
          Number(form.applicant_id);

        const sameEmployer =
          Number(referral.employer_id) === employerId;

        const rejectionStatus =
          String(referral.status || "").trim() ===
            "Rejected" ||
          String(referral.status || "").trim() ===
            "Failed";

        const hasEligibleDate =
          Boolean(referral.reapply_eligible_date);

        const isNotCurrentReferral =
          !currentReferralId ||
          Number(referral.referral_id) !==
            currentReferralId;

        return (
          sameApplicant &&
          sameEmployer &&
          rejectionStatus &&
          hasEligibleDate &&
          isNotCurrentReferral
        );
      }
    );

    if (cooldownReferrals.length === 0) {
      return null;
    }

    const futureCooldown = cooldownReferrals
      .filter(
        (referral) =>
          String(referral.reapply_eligible_date).substring(
            0,
            10
          ) > String(form.date_referred).substring(0, 10)
      )
      .sort((a, b) =>
        String(b.reapply_eligible_date).localeCompare(
          String(a.reapply_eligible_date)
        )
      );

    return futureCooldown[0] || null;
  };

  /* =========================================================
     FRONTEND DUPLICATE / COOLDOWN WARNING
  ========================================================= */

  const checkReferralWarnings = async () => {
    const duplicate = findDuplicateActiveReferral();

    if (duplicate) {
      const applicantName =
        selectedApplicant?.full_name ||
        duplicate.full_name ||
        "This applicant";

      const companyName =
        selectedVacancy?.company_name ||
        duplicate.company_name ||
        "this employer";

      const position =
        selectedVacancy?.position_title ||
        duplicate.position_title ||
        "this position";

      const result = await Swal.fire({
        icon: "warning",
        title: "Active Referral Detected",
        html: `
          <div class="text-left">
            <p class="text-slate-600">
              <strong>${applicantName}</strong> already has an
              active referral for:
            </p>

            <div class="mt-3 rounded-xl bg-amber-50 p-4">
              <p class="font-semibold text-slate-800">
                ${position}
              </p>

              <p class="mt-1 text-sm text-slate-600">
                ${companyName}
              </p>

              <p class="mt-2 text-sm text-amber-700">
                Current status:
                <strong>${duplicate.status}</strong>
              </p>

              <p class="mt-1 text-sm text-slate-500">
                Date referred:
                ${formatDisplayDate(
                  duplicate.date_referred
                )}
              </p>
            </div>

            <p class="mt-4 text-sm text-slate-500">
              A duplicate active referral should not be created.
            </p>
          </div>
        `,
        confirmButtonText: "Okay",
        confirmButtonColor: "#2563eb",
      });

      return result.isConfirmed;
    }

    const cooldown = findEmployerCooldown();

    if (cooldown) {
      const applicantName =
        selectedApplicant?.full_name ||
        cooldown.full_name ||
        "This applicant";

      const companyName =
        selectedVacancy?.company_name ||
        cooldown.company_name ||
        "this employer";

      const eligibleDate =
        cooldown.reapply_eligible_date;

      await Swal.fire({
        icon: "warning",
        title: "Reapplication Cooldown",
        html: `
          <div class="text-left">
            <p class="text-slate-600">
              <strong>${applicantName}</strong> cannot be
              referred to <strong>${companyName}</strong> yet.
            </p>

            <div class="mt-4 rounded-xl bg-amber-50 p-4">
              <p class="text-sm text-amber-800">
                Previous referral status:
                <strong>${cooldown.status}</strong>
              </p>

              <p class="mt-2 text-sm text-amber-800">
                Reapply eligible date:
              </p>

              <p class="mt-1 text-lg font-bold text-amber-900">
                ${formatDisplayDate(eligibleDate)}
              </p>
            </div>

            <p class="mt-4 text-sm text-slate-500">
              Please wait until the eligibility date before
              creating another referral for this employer.
            </p>
          </div>
        `,
        confirmButtonText: "Okay",
        confirmButtonColor: "#2563eb",
      });

      return true;
    }

    return false;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async () => {
    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    try {
      if (!form.applicant_id) {
        Swal.fire({
          icon: "warning",
          title: "Applicant Required",
          text: "Please select an applicant.",
        });

        return;
      }

      if (!form.vacancy_id) {
        Swal.fire({
          icon: "warning",
          title: "Vacancy Required",
          text: "Please select a job vacancy.",
        });

        return;
      }

      if (!form.date_referred) {
        Swal.fire({
          icon: "warning",
          title: "Referral Date Required",
          text: "Please select the referral date.",
        });

        return;
      }

      /* -----------------------------------------------------
         FRONTEND DUPLICATE / COOLDOWN CHECK
      ----------------------------------------------------- */

      const hasWarning =
        await checkReferralWarnings();

      if (hasWarning) {
        return;
      }

      setSubmitting(true);

      const payload = {
        applicant_id: Number(form.applicant_id),
        vacancy_id: Number(form.vacancy_id),

        status: form.status || "Pending",

        date_referred:
          form.date_referred || null,

        interview_date:
          form.interview_date || null,

        result:
          form.result?.trim() || null,

        rejection_reason:
          form.rejection_reason?.trim() || null,

        date_contacted:
          form.date_contacted || null,

        contacted_person:
          form.contacted_person?.trim() || null,

        contact_method:
          form.contact_method?.trim() || null,

        follow_up_result:
          form.follow_up_result?.trim() || null,

        next_follow_up:
          form.next_follow_up || null,
      };

      console.log(
        "SUBMIT REFERRAL PAYLOAD:",
        payload
      );

      if (editing && selectedReferral) {
        await updateReferral(
          selectedReferral.referral_id,
          payload
        );

        await Swal.fire({
          icon: "success",
          title: "Referral Updated",
          text:
            "Referral information has been updated successfully.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        await addReferral(payload);

        await Swal.fire({
          icon: "success",
          title: "Referral Added",
          text:
            "New referral has been added successfully.",
          timer: 1800,
          showConfirmButton: false,
        });
      }

      closeModal();

      await loadReferrals();
    } catch (error) {
      console.error(
        "SAVE REFERRAL ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: editing
          ? "Failed to Update Referral"
          : "Failed to Add Referral",
        text:
          error?.response?.data?.message ||
          "Something went wrong while saving the referral.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (referral) => {
    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete Referral?",
      html: `
        <p class="text-slate-600">
          Are you sure you want to delete this referral?
        </p>

        <p class="mt-2 font-semibold text-slate-800">
          ${referral.full_name || "Unknown Applicant"}
        </p>

        <p class="text-sm text-slate-500">
          ${referral.position_title || "Unknown Position"}
        </p>
      `,
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await deleteReferral(
        referral.referral_id
      );

      await Swal.fire({
        icon: "success",
        title: "Deleted",
        text:
          "Referral has been deleted successfully.",
        timer: 1800,
        showConfirmButton: false,
      });

      await loadReferrals();
    } catch (error) {
      console.error(
        "DELETE REFERRAL ERROR:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Failed to Delete",
        text:
          error?.response?.data?.message ||
          "Unable to delete the referral.",
      });
    }
  };


  // ==========================================================
  // DEPARTMENT HEAD APPROVAL
  // ==========================================================

  const handleApprove = async (referral) => {
    if (!isDepartmentHead || !referral?.referral_id) return;

    const result = await Swal.fire({
      icon: "question",
      title: "Approve Referral?",
      text: `Approve referral #${referral.referral_id}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await approveReferral(referral.referral_id);
      await loadReferrals();

      await Swal.fire({
        icon: "success",
        title: "Approved",
        text: "Referral has been approved.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("APPROVE REFERRAL ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text:
          error?.response?.data?.message ||
          "Failed to approve referral.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (referral) => {
    if (!isDepartmentHead || !referral?.referral_id) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Reject Referral",
      input: "textarea",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Enter the reason...",
      showCancelButton: true,
      confirmButtonText: "Reject Referral",
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
      await rejectReferral(
        referral.referral_id,
        result.value.trim()
      );
      await loadReferrals();

      await Swal.fire({
        icon: "success",
        title: "Rejected",
        text: "Referral has been rejected.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("REJECT REFERRAL ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Rejection Failed",
        text:
          error?.response?.data?.message ||
          "Failed to reject referral.",
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
          TOOLBAR
      ===================================================== */}

      <ReferralToolbar
        search={search}
        setSearch={setSearch}
        onAdd={
          (isPesoStaff || isDepartmentHead) ? handleAdd : null
        }
        onApprove={isDepartmentHead ? handleApprove : null}
        onReject={isDepartmentHead ? handleReject : null}
        totalReferrals={totalReferrals}
      />

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL REFERRALS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Referrals
              </p>

              <h3 className="mt-2 text-3xl font-bold text-slate-800">
                {totalReferrals}
              </h3>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FaExchangeAlt />
            </div>
          </div>
        </div>

        {/* PENDING */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Pending
              </p>

              <h3 className="mt-2 text-3xl font-bold text-amber-600">
                {pendingReferrals}
              </h3>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <FaClock />
            </div>
          </div>
        </div>

        {/* FOR INTERVIEW */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                For Interview
              </p>

              <h3 className="mt-2 text-3xl font-bold text-blue-600">
                {interviewReferrals}
              </h3>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FaCalendarCheck />
            </div>
          </div>
        </div>

        {/* HIRED */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Hired
              </p>

              <h3 className="mt-2 text-3xl font-bold text-green-600">
                {hiredReferrals}
              </h3>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <FaCheckCircle />
            </div>
          </div>
        </div>

      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <ReferralTable
        referrals={filteredReferrals}
        loading={loading}
        onView={handleView}
        onEdit={
          (isPesoStaff || isDepartmentHead) ? handleEdit : null
        }
        onDelete={
          (isPesoStaff || isDepartmentHead) ? handleDelete : null
        }
        onAdd={
          (isPesoStaff || isDepartmentHead) ? handleAdd : null
        }
        onApprove={isDepartmentHead ? handleApprove : null}
        onReject={isDepartmentHead ? handleReject : null}
      />

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {(isPesoStaff || isDepartmentHead) && (
        <ReferralModal
          isOpen={isModalOpen}
          onClose={closeModal}
          editing={editing}
          form={form}
          applicants={applicants}
          vacancies={vacancies}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={submitting}
        />
      )}

      {/* =====================================================
          VIEW MODAL
      ===================================================== */}

      <ReferralViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        referral={selectedReferral}
      />

    </div>
  );
}