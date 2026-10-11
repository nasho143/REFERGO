import Modal from "../common/Modal";
import Button from "../common/Button";
import ApprovalReviewInfo from "../common/ApprovalReviewInfo";

import {
  FaBuilding,
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function VacancyViewModal({
  isOpen,
  onClose,
  vacancy,
}) {
  if (!vacancy) return null;

  /* ==========================================================
     DATE FORMAT
  ========================================================== */

  const formatDate = (value) => {
    if (!value) return "Not specified";

    const dateOnly = String(value).substring(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      return "Not specified";
    }

    const [year, month, day] = dateOnly.split("-");

    return `${month}/${day}/${year}`;
  };

  /* ==========================================================
     VACANCY STATUS
  ========================================================== */

  const getVacancyStatus = () => {
    if (vacancy.status === "Closed") {
      return {
        label: "Closed",
        className: "bg-slate-100 text-slate-700",
        icon: <FaTimesCircle />,
      };
    }

    if (!vacancy.deadline) {
      return {
        label: "Active",
        className: "bg-green-100 text-green-700",
        icon: <FaCheckCircle />,
      };
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const deadline = new Date(
      `${String(vacancy.deadline).substring(0, 10)}T00:00:00`
    );

    if (Number.isNaN(deadline.getTime())) {
      return {
        label: "Active",
        className: "bg-green-100 text-green-700",
        icon: <FaCheckCircle />,
      };
    }

    const difference = Math.ceil(
      (deadline.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (difference < 0) {
      return {
        label: "Expired",
        className: "bg-red-100 text-red-700",
        icon: <FaTimesCircle />,
      };
    }

    if (difference <= 7) {
      return {
        label: "Expiring Soon",
        className: "bg-amber-100 text-amber-700",
        icon: <FaClock />,
      };
    }

    return {
      label: "Active",
      className: "bg-green-100 text-green-700",
      icon: <FaCheckCircle />,
    };
  };

  const status = getVacancyStatus();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Job Vacancy Details"
      subtitle="View complete information about this job vacancy."
      size="lg"
    >
      <div className="space-y-8">

        {/* ==================================================
            VACANCY SUMMARY
        ================================================== */}

        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {vacancy.position_title || "Untitled Position"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {vacancy.company_name || "No employer specified"}
                </p>
              </div>

              <span
                className={`
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-sm
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  ${status.className}
                `}
              >
                {status.icon}
                {status.label}
              </span>

            </div>
          </div>
        </section>

        <ApprovalReviewInfo
          approvalStatus={vacancy.approval_status}
          rejectionReason={vacancy.rejection_reason}
          reviewedBy={vacancy.reviewed_by}
          reviewedAt={vacancy.reviewed_at}
        />

        {/* ==================================================
            VACANCY INFORMATION
        ================================================== */}

        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              Vacancy Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Basic information about the job opportunity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            <InfoCard
              icon={<FaBuilding />}
              title="Employer"
              value={vacancy.company_name}
            />

            <InfoCard
              icon={<FaBriefcase />}
              title="Position"
              value={vacancy.position_title}
            />

            <InfoCard
              icon={<FaMapMarkerAlt />}
              title="Location"
              value={vacancy.location}
            />

            <InfoCard
              icon={<FaMoneyBillWave />}
              title="Salary"
              value={vacancy.salary}
            />

            <InfoCard
              icon={<FaClock />}
              title="Employment Type"
              value={vacancy.employment_type}
            />

            <InfoCard
              icon={<FaUsers />}
              title="Number of Openings"
              value={
                vacancy.openings !== null &&
                vacancy.openings !== undefined
                  ? vacancy.openings
                  : "Not specified"
              }
            />

            <InfoCard
              icon={<FaCalendarAlt />}
              title="Application Deadline"
              value={formatDate(vacancy.deadline)}
            />

            <InfoCard
              icon={<FaCheckCircle />}
              title="Status"
              value={vacancy.status || "Active"}
            />

          </div>
        </section>

        {/* ==================================================
            QUALIFICATIONS
        ================================================== */}

        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              Qualifications
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Qualifications required for applicants.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            {vacancy.qualifications ? (
              <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                {vacancy.qualifications}
              </p>
            ) : (
              <p className="text-sm italic text-slate-400">
                No qualifications specified.
              </p>
            )}
          </div>
        </section>

        {/* ==================================================
            REQUIREMENTS
        ================================================== */}

        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              Requirements
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Documents and other requirements for the position.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            {vacancy.requirements ? (
              <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                {vacancy.requirements}
              </p>
            ) : (
              <p className="text-sm italic text-slate-400">
                No requirements specified.
              </p>
            )}
          </div>
        </section>

      </div>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <div className="mt-8 flex justify-end border-t border-slate-200 pt-6">
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
}) {
  const displayValue =
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
      ? value
      : "Not specified";

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <span className="text-[#202860]">
          {icon}
        </span>

        <p className="text-sm font-semibold text-slate-700">
          {title}
        </p>
      </div>

      <p className="mt-2 break-words text-sm text-slate-600">
        {displayValue}
      </p>
    </div>
  );
}