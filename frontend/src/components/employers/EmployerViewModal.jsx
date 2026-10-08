import {
  FaBuilding,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
} from "react-icons/fa";

import Modal from "../common/Modal";
import Button from "../common/Button";
import ApprovalReviewInfo from "../common/ApprovalReviewInfo";

export default function EmployerViewModal({
  isOpen,
  onClose,
  employer,
}) {
  if (!employer) {
    return null;
  }

  const cooldownDays =
    employer.reapply_cooldown_days ?? 90;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employer Details"
      subtitle="View employer information and reapplication policy."
      size="lg"
    >
      <div className="space-y-8">

        {/* =====================================================
            EMPLOYER INFORMATION
        ====================================================== */}
        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              Employer Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              View the employer's company and contact information.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* COMPANY NAME */}
            <InfoCard
              icon={<FaBuilding />}
              title="Company Name"
              value={
                employer.company_name ||
                "Unnamed Company"
              }
            />

            {/* EMPLOYER ID */}
            <InfoCard
              icon={<FaBuilding />}
              title="Employer ID"
              value={
                employer.employer_id ||
                "N/A"
              }
            />

            {/* CONTACT PERSON */}
            <InfoCard
              icon={<FaUser />}
              title="Contact Person"
              value={
                employer.contact_person ||
                "Not provided"
              }
            />

            {/* CONTACT NUMBER */}
            <InfoCard
              icon={<FaPhone />}
              title="Contact Number"
              value={
                employer.contact_number ||
                "Not provided"
              }
            />

            {/* EMAIL */}
            <InfoCard
              icon={<FaEnvelope />}
              title="Email Address"
              value={
                employer.email ||
                "Not provided"
              }
              fullWidth
            />

            {/* ADDRESS */}
            <InfoCard
              icon={<FaMapMarkerAlt />}
              title="Company Address"
              value={
                employer.address ||
                "Not provided"
              }
              fullWidth
            />

          </div>
        </section>

        <ApprovalReviewInfo
          approvalStatus={employer.approval_status}
          rejectionReason={employer.rejection_reason}
          reviewedBy={employer.reviewed_by}
          reviewedAt={employer.reviewed_at}
        />

        {/* =====================================================
            REAPPLICATION POLICY
        ====================================================== */}
        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              Reapplication Policy
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              View the employer's applicant reapplication
              cooldown policy.
            </p>
          </div>

          {/* PURPLE COOLDOWN CARD */}
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              {/* POLICY INFORMATION */}
              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                  <FaClock className="text-purple-600" />
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-semibold text-slate-700">
                    Reapplication Cooldown
                  </p>

                  <p className="mt-1 max-w-xl text-sm leading-5 text-slate-500">
                    Applicants must wait this number of
                    days after rejection before reapplying
                    to this employer.
                  </p>

                </div>

              </div>

              {/* COOLDOWN DAYS */}
              <div className="shrink-0 rounded-xl bg-white px-5 py-3 text-center shadow-sm">

                <p className="text-2xl font-extrabold text-purple-700">
                  {cooldownDays}
                </p>

                <p className="text-[10px] font-bold uppercase tracking-wide text-purple-600">
                  Days
                </p>

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            POLICY SUMMARY
        ====================================================== */}
        <section>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">

            <div className="flex items-start gap-3">

              {/* BLUE VIEW MODAL ICON */}
              <span className="mt-0.5 shrink-0 text-blue-600">
                <FaCalendarAlt />
              </span>

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Reapplication Eligibility
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  If an applicant is rejected by this employer,
                  REFERGO can use the{" "}
                  <span className="font-semibold text-slate-800">
                    {cooldownDays}-day cooldown
                  </span>{" "}
                  to determine the applicant's next eligible
                  reapplication date.
                </p>
              </div>

            </div>

          </div>
        </section>

      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

        <Button
          variant="secondary"
          onClick={onClose}
        >
          Close
        </Button>

      </div>
    </Modal>
  );
}

/* ==========================================================
   INFO CARD
========================================================== */

function InfoCard({
  icon,
  title,
  value,
  fullWidth = false,
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${
        fullWidth ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-2">

        {/* ALL GENERAL VIEW MODAL ICONS = BLUE */}
        <span className="shrink-0 text-blue-600">
          {icon}
        </span>

        <p className="text-sm font-semibold text-slate-700">
          {title}
        </p>

      </div>

      <p className="mt-2 break-words text-sm leading-6 text-slate-600">
        {value}
      </p>
    </div>
  );
}