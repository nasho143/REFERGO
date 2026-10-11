import { useEffect, useMemo, useState } from "react";

import StatStrip from "../components/common/StatStrip";
import {
  getApplicants,
  addApplicant,
  updateApplicant,
  deleteApplicant,
} from "../services/applicantApi";

import ApplicantToolbar from "../components/applicants/ApplicantToolbar";
import ApplicantTable from "../components/applicants/ApplicantTable";
import ApplicantModal from "../components/applicants/ApplicantModal";
import ApplicantViewModal from "../components/applicants/ApplicantViewModal";

import ConfirmModal from "../components/common/ConfirmModal";
import Swal from "sweetalert2";

import {
  approveApplicant,
  rejectApplicant,
} from "../services/approvalApi";

export default function Applicants() {
  // ==========================================================
  // USER / ROLE
  // ==========================================================

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch {
      return null;
    }
  }, []);

  const currentRole = String(user?.role || "").trim().toLowerCase();

  const isPesoStaff =
    currentRole === "peso_staff";

  const isDepartmentHead =
    currentRole === "department_head";


  // ==========================================================
  // STATE
  // ==========================================================

  const [applicants, setApplicants] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [selectedApplicant, setSelectedApplicant] =
    useState(null);


  // ==========================================================
  // FORM STATE
  // ==========================================================
  //
  // IMPORTANT:
  // Readiness score fields are intentionally NOT included here.
  //
  // The backend automatically calculates:
  //
  // - profile_completion_score
  // - resume_score
  // - requirements_score
  // - skills_score
  // - interview_readiness_score
  // - job_readiness_score
  //
  // based on the applicant's actual information.
  //
  // ==========================================================

  const [form, setForm] = useState({
    applicant_id: "",

    full_name: "",
    contact_number: "",
    classification: "",
    education: "",
    work_experience: "",
    skills: "",
    address: "",

    resume_uploaded: false,
    valid_id_uploaded: false,
    diploma_tor_uploaded: false,

    peso_comment: "",
  });


  // ==========================================================
  // LOAD APPLICANTS
  // ==========================================================

  async function loadApplicants() {
    try {
      setLoading(true);

      const response = await getApplicants();

      console.log(
        "APPLICANTS RESPONSE:",
        response
      );

      /*
       * Backend normally returns:
       *
       * {
       *   success: true,
       *   applicants: [...]
       * }
       *
       * Depending on applicantApi.js,
       * getApplicants() may return:
       *
       * 1. response.data
       *
       * OR
       *
       * 2. complete Axios response
       */

      const responseData =
        response?.data ?? response;

      console.log(
        "NORMALIZED APPLICANTS RESPONSE:",
        responseData
      );

      let applicantsData = [];


      // ======================================================
      // CASE 1
      // ======================================================

      if (Array.isArray(responseData)) {
        applicantsData = responseData;
      }


      // ======================================================
      // CASE 2
      // ======================================================

      else if (
        Array.isArray(
          responseData?.applicants
        )
      ) {
        applicantsData =
          responseData.applicants;
      }


      // ======================================================
      // CASE 3
      // ======================================================

      else if (
        Array.isArray(
          responseData?.data
        )
      ) {
        applicantsData =
          responseData.data;
      }


      // ======================================================
      // FINAL RESULT
      // ======================================================

      console.log(
        "APPLICANTS DATA:",
        applicantsData
      );

      setApplicants(applicantsData);

    } catch (err) {
      console.error(
        "LOAD APPLICANTS ERROR:",
        err
      );

      console.error(
        "LOAD APPLICANTS ERROR RESPONSE:",
        err?.response?.data
      );

      setApplicants([]);

    } finally {
      setLoading(false);
    }
  }


  // ==========================================================
  // LOAD WHEN PAGE OPENS
  // ==========================================================

  useEffect(() => {
    loadApplicants();
  }, []);


  // ==========================================================
  // SEARCH / FILTER
  // ==========================================================

  const filteredApplicants =
    useMemo(() => {
      if (!Array.isArray(applicants)) {
        return [];
      }

      const searchValue =
        search.toLowerCase().trim();

      if (!searchValue) {
        return applicants;
      }

      return applicants.filter(
        (applicant) => {
          const fullName =
            applicant?.full_name
              ?.toLowerCase() || "";

          const classification =
            applicant?.classification
              ?.toLowerCase() || "";

          const education =
            applicant?.education
              ?.toLowerCase() || "";

          const skills =
            applicant?.skills
              ?.toLowerCase() || "";

          const address =
            applicant?.address
              ?.toLowerCase() || "";

          return (
            fullName.includes(searchValue) ||
            classification.includes(searchValue) ||
            education.includes(searchValue) ||
            skills.includes(searchValue) ||
            address.includes(searchValue)
          );
        }
      );
    }, [applicants, search]);


  // ==========================================================
  // SUMMARY COUNTS
  // ==========================================================

  const totalApplicants =
    applicants.length;


  /*
   * Job Ready
   *
   * Backend automatically calculates
   * job_readiness_score.
   *
   * 80 and above = Job Ready.
   */

  const jobReadyApplicants =
    applicants.filter((applicant) => {
      const score = Number(
        applicant?.job_readiness_score || 0
      );

      return score >= 80;
    }).length;


  /*
   * Incomplete Profiles
   *
   * Backend automatically calculates
   * profile_completion_score.
   */

  const incompleteProfiles =
    applicants.filter((applicant) => {
      const score = Number(
        applicant?.profile_completion_score || 0
      );

      return score < 100;
    }).length;


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (e) => {
    if (!e?.target) {
      return;
    }

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    /*
     * Ignore readiness score updates.
     *
     * This protects the frontend from accidentally
     * treating readiness scores as editable fields.
     */

    const automaticScoreFields = [
      "profile_completion_score",
      "resume_score",
      "requirements_score",
      "skills_score",
      "interview_readiness_score",
      "job_readiness_score",
      "__automatic_readiness_scores__",
    ];

    if (
      automaticScoreFields.includes(name)
    ) {
      return;
    }

    setForm((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  // ==========================================================
  // RESET FORM
  // ==========================================================

  const resetForm = () => {
    setForm({
      applicant_id: "",

      full_name: "",
      contact_number: "",
      classification: "",
      education: "",
      work_experience: "",
      skills: "",
      address: "",

      resume_uploaded: false,
      valid_id_uploaded: false,
      diploma_tor_uploaded: false,

      peso_comment: "",
    });
  };


  // ==========================================================
  // OPEN ADD MODAL
  // ==========================================================

  const openAddModal = () => {
    /*
     * Only PESO Staff can add applicants.
     */

    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    setEditing(false);

    resetForm();

    setShowModal(true);
  };


  // ==========================================================
  // OPEN EDIT MODAL
  // ==========================================================

  const openEditModal = (applicant) => {
    /*
     * Only PESO Staff can edit applicants.
     */

    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    if (!applicant) {
      return;
    }

    setEditing(true);

    /*
     * IMPORTANT:
     *
     * We only copy editable applicant information.
     *
     * Readiness scores are NOT copied into the form
     * because they are automatically calculated by
     * the backend.
     */

    setForm({
      applicant_id:
        applicant.applicant_id || "",

      full_name:
        applicant.full_name || "",

      contact_number:
        applicant.contact_number || "",

      classification:
        applicant.classification || "",

      education:
        applicant.education || "",

      work_experience:
        applicant.work_experience || "",

      skills:
        applicant.skills || "",

      address:
        applicant.address || "",

      resume_uploaded:
        Boolean(
          Number(
            applicant.resume_uploaded
          )
        ),

      valid_id_uploaded:
        Boolean(
          Number(
            applicant.valid_id_uploaded
          )
        ),

      diploma_tor_uploaded:
        Boolean(
          Number(
            applicant.diploma_tor_uploaded
          )
        ),

      peso_comment:
        applicant.peso_comment || "",
    });

    setShowModal(true);
  };


  // ==========================================================
  // OPEN VIEW MODAL
  // ==========================================================

  const openViewModal = (applicant) => {
    if (!applicant) {
      return;
    }

    setSelectedApplicant(applicant);

    setShowViewModal(true);
  };


  // ==========================================================
  // OPEN DELETE MODAL
  // ==========================================================

  const openDeleteModal = (applicant) => {
    /*
     * Only PESO Staff can delete applicants.
     */

    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    if (!applicant) {
      return;
    }

    setSelectedApplicant(applicant);

    setShowDeleteModal(true);
  };


  // ==========================================================
  // PREPARE APPLICANT PAYLOAD
  // ==========================================================
  //
  // Only editable information is sent.
  //
  // The backend calculates all readiness scores.
  //
  // ==========================================================

  const buildApplicantPayload = () => {
    return {
      full_name:
        String(form.full_name || "").trim(),

      address:
        form.address || null,

      contact_number:
        form.contact_number || null,

      classification:
        form.classification || null,

      education:
        form.education || null,

      work_experience:
        form.work_experience || null,

      skills:
        form.skills || null,

      resume_uploaded:
        form.resume_uploaded ? 1 : 0,

      valid_id_uploaded:
        form.valid_id_uploaded ? 1 : 0,

      diploma_tor_uploaded:
        form.diploma_tor_uploaded ? 1 : 0,

      peso_comment:
        form.peso_comment || null,
    };
  };


  // ==========================================================
  // ADD / UPDATE APPLICANT
  // ==========================================================

  const handleSubmit = async () => {
    /*
     * Department Head cannot save changes.
     */

    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    /*
     * Validate full name.
     */

    if (
      !form.full_name ||
      !String(form.full_name).trim()
    ) {
      alert(
        "Please enter the applicant's full name."
      );

      return;
    }

    try {
      setLoading(true);

      /*
       * Build a clean payload.
       *
       * Notice that readiness score fields
       * are intentionally NOT included.
       */

      const payload =
        buildApplicantPayload();


      // ======================================================
      // UPDATE
      // ======================================================

      if (editing) {
        await updateApplicant(
          form.applicant_id,
          payload
        );
      }


      // ======================================================
      // ADD
      // ======================================================

      else {
        await addApplicant(
          payload
        );
      }


      // ======================================================
      // CLOSE MODAL
      // ======================================================

      setShowModal(false);

      resetForm();


      // ======================================================
      // RELOAD DATA
      // ======================================================
      //
      // This is important because the backend has now
      // calculated the new readiness scores.
      //
      // The refreshed applicant data will contain:
      //
      // profile_completion_score
      // resume_score
      // requirements_score
      // skills_score
      // interview_readiness_score
      // job_readiness_score
      //
      // ======================================================

      await loadApplicants();

    } catch (err) {
      console.error(
        "SAVE APPLICANT ERROR:",
        err
      );

      console.error(
        "SAVE APPLICANT ERROR RESPONSE:",
        err?.response?.data
      );

      alert(
        err?.response?.data?.message ||
          "Failed to save applicant."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // DELETE APPLICANT
  // ==========================================================

  const handleDelete = async () => {
    /*
     * Department Head cannot delete.
     */

    if (!isPesoStaff && !isDepartmentHead) {
      return;
    }

    if (
      !selectedApplicant?.applicant_id
    ) {
      return;
    }

    try {
      setLoading(true);

      await deleteApplicant(
        selectedApplicant.applicant_id
      );

      setShowDeleteModal(false);

      setSelectedApplicant(null);

      await loadApplicants();

    } catch (err) {
      console.error(
        "DELETE APPLICANT ERROR:",
        err
      );

      console.error(
        "DELETE APPLICANT ERROR RESPONSE:",
        err?.response?.data
      );

      alert(
        err?.response?.data?.message ||
          "Failed to delete applicant."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // CLOSE ADD / EDIT MODAL
  // ==========================================================

  const closeApplicantModal = () => {
    setShowModal(false);

    resetForm();
  };


  // ==========================================================
  // CLOSE VIEW MODAL
  // ==========================================================

  const closeViewModal = () => {
    setShowViewModal(false);

    setSelectedApplicant(null);
  };


  // ==========================================================
  // CLOSE DELETE MODAL
  // ==========================================================

  const closeDeleteModal = () => {
    setShowDeleteModal(false);

    setSelectedApplicant(null);
  };


  // ==========================================================

  // ==========================================================
  // DEPARTMENT HEAD APPROVAL
  // ==========================================================

  const handleApprove = async (applicant) => {
    if (!isDepartmentHead || !applicant?.applicant_id) return;

    const result = await Swal.fire({
      icon: "question",
      title: "Approve Applicant?",
      text: `Approve ${applicant.full_name || "this applicant"}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#1e6b3c",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await approveApplicant(applicant.applicant_id);
      await loadApplicants();

      await Swal.fire({
        icon: "success",
        title: "Approved",
        text: "Applicant has been approved.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("APPROVE APPLICANT ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text:
          error?.response?.data?.message ||
          "Failed to approve applicant.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (applicant) => {
    if (!isDepartmentHead || !applicant?.applicant_id) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Reject Applicant",
      input: "textarea",
      inputLabel: "Reason for rejection",
      inputPlaceholder: "Enter the reason...",
      inputAttributes: { "aria-label": "Rejection reason" },
      showCancelButton: true,
      confirmButtonText: "Reject Applicant",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#c8142f",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Rejection reason is required.";
        }
      },
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await rejectApplicant(
        applicant.applicant_id,
        result.value.trim()
      );
      await loadApplicants();

      await Swal.fire({
        icon: "success",
        title: "Rejected",
        text: "Applicant has been rejected.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("REJECT APPLICANT ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "Rejection Failed",
        text:
          error?.response?.data?.message ||
          "Failed to reject applicant.",
      });
    } finally {
      setLoading(false);
    }
  };

  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6">

      {/* ====================================================
          MODULE HEADER + SEARCH
      ===================================================== */}

      <ApplicantToolbar
        search={search}
        setSearch={setSearch}
        totalApplicants={
          filteredApplicants.length
        }
        onAdd={
          (isPesoStaff || isDepartmentHead) ? openAddModal : null
        }
      />


      {/* ====================================================
          SUMMARY CARDS
      ===================================================== */}

      <StatStrip
        items={[
          { label: "Total Applicants", value: totalApplicants },
          { label: "Job Ready", value: jobReadyApplicants },
          { label: "Incomplete Profiles", value: incompleteProfiles },
        ]}
      />


      {/* ====================================================
          APPLICANT TABLE
      ===================================================== */}

      <ApplicantTable
        applicants={filteredApplicants}
        loading={loading}

        onAdd={
          (isPesoStaff || isDepartmentHead) ? openAddModal : null
        }

        onView={openViewModal}

        onEdit={
          (isPesoStaff || isDepartmentHead) ? openEditModal : null
        }

        onDelete={
          (isPesoStaff || isDepartmentHead) ? openDeleteModal : null
        }
        onApprove={isDepartmentHead ? handleApprove : null}
        onReject={isDepartmentHead ? handleReject : null}
      />


      {/* ====================================================
          ADD / EDIT APPLICANT MODAL
      ===================================================== */}

      {(isPesoStaff || isDepartmentHead) && (
        <ApplicantModal
          isOpen={showModal}
          onClose={closeApplicantModal}
          editing={editing}
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
        />
      )}


      {/* ====================================================
          VIEW APPLICANT MODAL
      ===================================================== */}

      <ApplicantViewModal
        isOpen={showViewModal}
        onClose={closeViewModal}
        applicant={selectedApplicant}
      />


      {/* ====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {(isPesoStaff || isDepartmentHead) && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          onConfirm={handleDelete}
          loading={loading}
          title="Delete Applicant"
          message={`Are you sure you want to delete "${
            selectedApplicant?.full_name ||
            "this applicant"
          }"? This action cannot be undone.`}
          confirmText="Delete Applicant"
          variant="danger"
        />
      )}

    </div>
  );
}