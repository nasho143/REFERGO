import { useMemo } from "react";
import {
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaUserTag,
  FaGraduationCap,
  FaUserTie,
  FaTools,
  FaFileAlt,
  FaFile,
  FaIdCard,
  FaChartBar,
  FaCommentDots,
} from "react-icons/fa";

import Modal from "../common/Modal";
import Button from "../common/Button";

export default function ApplicantModal({
  isOpen,
  onClose,
  editing = false,
  form = {},
  handleChange,
  handleSubmit,
  loading = false,
}) {
  // ==========================================================
  // AUTOMATIC APPLICANT READINESS SCORE
  // ==========================================================

  const readinessScores = useMemo(() => {
    const profileFields = [
      form.full_name,
      form.address,
      form.contact_number,
      form.classification,
      form.education,
      form.work_experience,
    ];

    const completedProfileFields =
      profileFields.filter(
        (field) =>
          field !== null &&
          field !== undefined &&
          String(field).trim() !== ""
      ).length;

    const profileCompletionScore = Math.round(
      (completedProfileFields / profileFields.length) * 100
    );

    const resumeScore = form.resume_uploaded ? 100 : 0;

    const validIdScore = form.valid_id_uploaded ? 100 : 0;

    const diplomaTorScore = form.diploma_tor_uploaded ? 100 : 0;

    const requirementsScore = Math.round(
      (resumeScore + validIdScore + diplomaTorScore) / 3
    );

    const skillsScore =
      form.skills && String(form.skills).trim() !== "" ? 100 : 0;

    const interviewReadinessScore = Math.round(
      (profileCompletionScore + requirementsScore + skillsScore) / 3
    );

    const jobReadinessScore = Math.round(
      profileCompletionScore * 0.3 +
        resumeScore * 0.15 +
        requirementsScore * 0.25 +
        skillsScore * 0.15 +
        interviewReadinessScore * 0.15
    );

    return {
      profileCompletionScore,
      resumeScore,
      requirementsScore,
      skillsScore,
      interviewReadinessScore,
      jobReadinessScore,
    };
  }, [form]);

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const submitForm = () => {
    if (typeof handleSubmit === "function") {
      handleSubmit();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Edit Applicant" : "Add Applicant"}
      subtitle={
        editing
          ? "Update applicant information and readiness details."
          : "Enter applicant information and requirements."
      }
      size="lg"
    >
      <div className="space-y-8">

        {/* ==================================================
            PERSONAL INFORMATION
        =================================================== */}
        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              Personal Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Enter the applicant's basic personal information.
            </p>
          </div>

          <div className="space-y-5">

            {/* FULL NAME */}
            <FormField
              icon={<FaUser />}
              iconColor="text-blue-600"
              label="Full Name"
            >
              <input
                type="text"
                name="full_name"
                value={form.full_name || ""}
                onChange={handleChange}
                placeholder="Enter full name"
                className={inputClass}
              />
            </FormField>

            {/* ADDRESS */}
            <FormField
              icon={<FaMapMarkerAlt />}
              iconColor="text-red-500"
              label="Address"
            >
              <textarea
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                rows="3"
                placeholder="Enter complete address"
                className={textareaClass}
              />
            </FormField>

            {/* CONTACT NUMBER */}
            <FormField
              icon={<FaPhone />}
              iconColor="text-green-600"
              label="Contact Number"
            >
              <input
                type="text"
                name="contact_number"
                value={form.contact_number || ""}
                onChange={handleChange}
                placeholder="09XXXXXXXXX"
                className={inputClass}
              />
            </FormField>

            {/* CLASSIFICATION */}
            <FormField
              icon={<FaUserTag />}
              iconColor="text-purple-600"
              label="Applicant Classification"
            >
              <select
                name="classification"
                value={form.classification || ""}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select Classification</option>

                <option value="First-Time Job Seeker">
                  First-Time Job Seeker
                </option>

                <option value="Experienced Worker">
                  Experienced Worker
                </option>

                <option value="Fresh Graduate">
                  Fresh Graduate
                </option>

                <option value="OFW Returnee">
                  OFW Returnee
                </option>

                <option value="Displaced Worker">
                  Displaced Worker
                </option>

                <option value="PWD">
                  PWD
                </option>

                <option value="OSY">
                  OSY
                </option>

                <option value="Senior Citizen">
                  Senior Citizen
                </option>
              </select>
            </FormField>

          </div>
        </section>

        {/* ==================================================
            EDUCATION & EXPERIENCE
        =================================================== */}
        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              Education & Experience
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add the applicant's educational background,
              experience, and skills.
            </p>
          </div>

          <div className="space-y-5">

            {/* EDUCATION */}
            <FormField
              icon={<FaGraduationCap />}
              iconColor="text-purple-600"
              label="Education"
            >
              <input
                type="text"
                name="education"
                value={form.education || ""}
                onChange={handleChange}
                placeholder="Example: BS Information Technology"
                className={inputClass}
              />
            </FormField>

            {/* WORK EXPERIENCE */}
            <FormField
              icon={<FaUserTie />}
              iconColor="text-orange-500"
              label="Work Experience"
            >
              <textarea
                name="work_experience"
                value={form.work_experience || ""}
                onChange={handleChange}
                rows="4"
                placeholder="Enter work experience"
                className={textareaClass}
              />
            </FormField>

            {/* SKILLS */}
            <FormField
              icon={<FaTools />}
              iconColor="text-amber-500"
              label="Skills"
            >
              <textarea
                name="skills"
                value={form.skills || ""}
                onChange={handleChange}
                rows="4"
                placeholder="Example: Communication, Customer Service, Computer Literacy"
                className={textareaClass}
              />
            </FormField>

          </div>
        </section>

        {/* ==================================================
            REQUIREMENTS CHECKLIST
        =================================================== */}
        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">

            <div className="flex items-center gap-2">
              <span className="text-blue-600">
                <FaFileAlt />
              </span>

              <h3 className="text-lg font-bold text-slate-800">
                Requirements Checklist
              </h3>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Check the requirements that have already been
              submitted.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            {/* RESUME */}
            <RequirementCard
              name="resume_uploaded"
              checked={Boolean(form.resume_uploaded)}
              onChange={handleChange}
              icon={<FaFile />}
              iconColor="text-blue-600"
              title="Resume / CV"
              description="Resume uploaded"
            />

            {/* VALID ID */}
            <RequirementCard
              name="valid_id_uploaded"
              checked={Boolean(form.valid_id_uploaded)}
              onChange={handleChange}
              icon={<FaIdCard />}
              iconColor="text-green-600"
              title="Valid ID"
              description="Valid ID uploaded"
            />

            {/* DIPLOMA / TOR */}
            <RequirementCard
              name="diploma_tor_uploaded"
              checked={Boolean(form.diploma_tor_uploaded)}
              onChange={handleChange}
              icon={<FaGraduationCap />}
              iconColor="text-purple-600"
              title="Diploma / TOR"
              description="Diploma or TOR uploaded"
            />

          </div>
        </section>

        {/* ==================================================
            AUTOMATIC APPLICANT READINESS SCORE
        =================================================== */}
        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2">
                  <span className="text-purple-600">
                    <FaChartBar />
                  </span>

                  <h3 className="text-lg font-bold text-slate-800">
                    Applicant Readiness Score
                  </h3>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Automatically calculated from the applicant's
                  information and requirements.
                </p>

              </div>

              <span className="inline-flex w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Automatic
              </span>

            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <ScoreCard
              title="Profile Completion"
              score={readinessScores.profileCompletionScore}
            />

            <ScoreCard
              title="Resume Score"
              score={readinessScores.resumeScore}
            />

            <ScoreCard
              title="Requirements Score"
              score={readinessScores.requirementsScore}
            />

            <ScoreCard
              title="Skills Score"
              score={readinessScores.skillsScore}
            />

            <ScoreCard
              title="Interview Readiness"
              score={readinessScores.interviewReadinessScore}
            />

            <ScoreCard
              title="Overall Job Readiness"
              score={readinessScores.jobReadinessScore}
              highlight
            />

          </div>
        </section>

        {/* ==================================================
            PESO ASSESSMENT
        =================================================== */}
        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">

            <div className="flex items-center gap-2">
              <span className="text-orange-500">
                <FaCommentDots />
              </span>

              <h3 className="text-lg font-bold text-slate-800">
                PESO Assessment
              </h3>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Add notes or recommendations for the applicant.
            </p>

          </div>

          <textarea
            name="peso_comment"
            value={form.peso_comment || ""}
            onChange={handleChange}
            rows="4"
            placeholder="Enter PESO assessment or comment..."
            className={textareaClass}
          />
        </section>

      </div>

      {/* ==================================================
          FOOTER
      =================================================== */}
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          loading={loading}
          onClick={submitForm}
        >
          {editing ? "Update Applicant" : "Save Applicant"}
        </Button>

      </div>
    </Modal>
  );
}

/* ==========================================================
   FORM FIELD
========================================================== */

function FormField({
  icon,
  iconColor,
  label,
  children,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">

        <span className={`${iconColor} shrink-0`}>
          {icon}
        </span>

        <label className="text-sm font-semibold text-slate-700">
          {label}
        </label>

      </div>

      {children}
    </div>
  );
}

/* ==========================================================
   REQUIREMENT CARD
========================================================== */

function RequirementCard({
  name,
  checked,
  onChange,
  icon,
  iconColor,
  title,
  description,
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-blue-50">

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
      />

      <div className="min-w-0">

        <div className="flex items-center gap-2">

          <span className={`${iconColor} shrink-0`}>
            {icon}
          </span>

          <p className="text-sm font-semibold text-slate-700">
            {title}
          </p>

        </div>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>

      </div>

    </label>
  );
}

/* ==========================================================
   SCORE CARD
========================================================== */

function ScoreCard({
  title,
  score,
  highlight = false,
}) {
  return (
    <div
      className={`
        rounded-xl
        border
        p-4
        transition
        ${
          highlight
            ? "border-blue-200 bg-blue-50"
            : "border-slate-200 bg-slate-50"
        }
      `}
    >
      <div className="flex items-center justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm font-semibold text-slate-700">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Automatically calculated
          </p>

        </div>

        <div
          className={`
            flex
            h-12
            w-16
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-lg
            font-bold
            ${
              highlight
                ? "bg-blue-600 text-white"
                : "bg-white text-blue-700"
            }
          `}
        >
          {score}%
        </div>

      </div>
    </div>
  );
}

/* ==========================================================
   INPUT STYLES
========================================================== */

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const textareaClass =
  "w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";