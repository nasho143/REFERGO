import { useEffect, useMemo, useState } from "react";

import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaTools,
  FaFileAlt,
  FaIdCard,
  FaCertificate,
  FaChartLine,
  FaCheckCircle,
  FaTimesCircle,
  FaExchangeAlt,
  FaCalendarAlt,
  FaBuilding,
  FaClock,
  FaCommentDots,
  FaInfoCircle,
  FaRedoAlt,
  FaBell,
} from "react-icons/fa";

import { getApplicantReferrals } from "../../services/applicantApi";
import ApprovalReviewInfo from "../common/ApprovalReviewInfo";

export default function ApplicantViewModal({
  isOpen,
  onClose,
  applicant,
}) {
  // ==========================================================
  // STATE
  // ==========================================================

  const [referrals, setReferrals] = useState([]);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [referralError, setReferralError] = useState("");

  // ==========================================================
  // LOAD REFERRAL HISTORY
  // ==========================================================

  useEffect(() => {
    if (!isOpen || !applicant?.applicant_id) {
      setReferrals([]);
      setReferralError("");
      return;
    }

    let mounted = true;

    async function loadReferralHistory() {
      try {
        setLoadingReferrals(true);
        setReferralError("");

        const response = await getApplicantReferrals(
          applicant.applicant_id
        );

        if (!mounted) return;

        const responseData = response?.data ?? response;

        let referralData = [];

        if (Array.isArray(responseData)) {
          referralData = responseData;
        } else if (Array.isArray(responseData?.referrals)) {
          referralData = responseData.referrals;
        } else if (Array.isArray(responseData?.data)) {
          referralData = responseData.data;
        }

        setReferrals(referralData);
      } catch (error) {
        console.error(
          "LOAD APPLICANT REFERRALS ERROR:",
          error
        );

        if (!mounted) return;

        setReferrals([]);

        setReferralError(
          error?.response?.data?.message ||
            "Unable to load referral history."
        );
      } finally {
        if (mounted) {
          setLoadingReferrals(false);
        }
      }
    }

    loadReferralHistory();

    return () => {
      mounted = false;
    };
  }, [isOpen, applicant?.applicant_id]);

  // ==========================================================
  // HELPERS
  // ==========================================================

  const formatDate = (value) => {
    if (!value) return "—";

    const stringValue = String(value);

    const match = stringValue.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (match) {
      return `${match[2]}/${match[3]}/${match[1]}`;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getDateValue = (value) => {
    if (!value) return 0;

    const match = String(value).match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (match) {
      return new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
      ).getTime();
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? 0
      : date.getTime();
  };

  const getStatusClass = (status) => {
    const value = String(status || "")
      .toLowerCase()
      .trim();

    if (value === "hired") {
      return "bg-green-100 text-green-700";
    }

    if (value === "rejected" || value === "failed") {
      return "bg-red-100 text-red-700";
    }

    if (
      value === "for interview" ||
      value === "interview scheduled"
    ) {
      return "bg-[#eef0f8] text-[#202860]";
    }

    if (value === "pending") {
      return "bg-amber-100 text-amber-700";
    }

    if (
      value === "cancelled" ||
      value === "expired"
    ) {
      return "bg-slate-200 text-slate-700";
    }

    if (value === "no response") {
      return "bg-purple-100 text-purple-700";
    }

    return "bg-slate-100 text-slate-700";
  };

  const getJourneyStatusClass = (type) => {
    switch (type) {
      case "success":
        return {
          icon: FaCheckCircle,
          circle: "bg-green-100 text-green-600",
          line: "bg-green-200",
        };

      case "danger":
        return {
          icon: FaTimesCircle,
          circle: "bg-red-100 text-red-600",
          line: "bg-red-200",
        };

      case "warning":
        return {
          icon: FaClock,
          circle: "bg-amber-100 text-amber-600",
          line: "bg-amber-200",
        };

      case "info":
        return {
          icon: FaExchangeAlt,
          circle: "bg-[#eef0f8] text-[#202860]",
          line: "bg-[#bfc6e2]",
        };

      default:
        return {
          icon: FaInfoCircle,
          circle: "bg-slate-100 text-slate-600",
          line: "bg-slate-200",
        };
    }
  };

  // ==========================================================
  // READINESS SCORES
  // ==========================================================

  const scores = useMemo(() => {
    if (!applicant) {
      return {
        profile: 0,
        resume: 0,
        requirements: 0,
        skills: 0,
        interview: 0,
        overall: 0,
      };
    }

    return {
      profile:
        Number(applicant.profile_completion_score) || 0,

      resume:
        Number(applicant.resume_score) || 0,

      requirements:
        Number(applicant.requirements_score) || 0,

      skills:
        Number(applicant.skills_score) || 0,

      interview:
        Number(applicant.interview_readiness_score) || 0,

      overall:
        Number(applicant.job_readiness_score) || 0,
    };
  }, [applicant]);

  const readinessLabel =
    scores.overall >= 80
      ? "Job Ready"
      : scores.overall >= 60
      ? "Nearly Ready"
      : "Needs Improvement";

  const readinessClass =
    scores.overall >= 80
      ? "bg-green-100 text-green-700"
      : scores.overall >= 60
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  // ==========================================================
  // REQUIREMENT STATUS
  // ==========================================================

  const requirements = [
    {
      label: "Resume / CV",
      uploaded:
        Number(applicant?.resume_uploaded) === 1,
      icon: FaFileAlt,
    },
    {
      label: "Valid ID",
      uploaded:
        Number(applicant?.valid_id_uploaded) === 1,
      icon: FaIdCard,
    },
    {
      label: "Diploma / TOR",
      uploaded:
        Number(applicant?.diploma_tor_uploaded) === 1,
      icon: FaCertificate,
    },
  ];

  // ==========================================================
  // SORT REFERRALS
  // ==========================================================

  const sortedReferrals = useMemo(() => {
    if (!Array.isArray(referrals)) {
      return [];
    }

    return [...referrals].sort(
      (a, b) =>
        getDateValue(b?.date_referred) -
        getDateValue(a?.date_referred)
    );
  }, [referrals]);

  // ==========================================================
  // CAREER JOURNEY
  // ==========================================================

  const careerJourney = useMemo(() => {
    const events = [];

    if (!applicant) {
      return events;
    }

    // --------------------------------------------------------
    // REGISTERED
    // --------------------------------------------------------

    events.push({
      title: "Registered",
      description:
        "Applicant registered in the REFERGO system.",
      date: applicant.created_at,
      type: "info",
    });

    // --------------------------------------------------------
    // REFERRALS
    // --------------------------------------------------------

    sortedReferrals.forEach((referral) => {
      const status = String(
        referral?.status || ""
      ).toLowerCase();

      const company =
        referral?.company_name || "Employer";

      const position =
        referral?.position_title || "Job Position";

      const referralDate =
        referral?.date_referred;

      // Referred
      if (referralDate) {
        events.push({
          title: "Referred",
          description: `${position} at ${company}.`,
          date: referralDate,
          type: "info",
        });
      }

      // Interview Scheduled
      if (referral?.interview_date) {
        events.push({
          title: "Interview Scheduled",
          description: `${position} at ${company}.`,
          date: referral.interview_date,
          type: "info",
        });
      }

      // Interviewed
      if (
        referral?.interview_date &&
        [
          "hired",
          "rejected",
          "failed",
          "no response",
          "expired",
        ].includes(status)
      ) {
        events.push({
          title: "Interviewed",
          description: `${position} at ${company}.`,
          date: referral.interview_date,
          type: "info",
        });
      }

      // For Interview
      if (
        status === "for interview" &&
        !referral?.interview_date
      ) {
        events.push({
          title: "For Interview",
          description: `${position} at ${company}.`,
          date: referralDate,
          type: "warning",
        });
      }

      // Pending
      if (status === "pending") {
        events.push({
          title: "Pending",
          description: `${position} at ${company}.`,
          date: referralDate,
          type: "warning",
        });
      }

      // Hired
      if (status === "hired") {
        events.push({
          title: "Hired",
          description: `${position} at ${company}.`,
          date:
            referral?.interview_date ||
            referralDate,
          type: "success",
        });
      }

      // Rejected
      if (status === "rejected") {
        events.push({
          title: "Rejected",
          description:
            referral?.rejection_reason ||
            `${position} at ${company}.`,
          date: referralDate,
          type: "danger",
        });
      }

      // Failed
      if (status === "failed") {
        events.push({
          title: "Failed",
          description:
            referral?.rejection_reason ||
            `Application for ${position} at ${company}.`,
          date: referralDate,
          type: "danger",
        });
      }

      // No Response
      if (status === "no response") {
        events.push({
          title: "No Response",
          description:
            `${company} has not provided a response.`,
          date: referralDate,
          type: "warning",
        });
      }

      // Expired
      if (status === "expired") {
        events.push({
          title: "Expired",
          description:
            `Referral for ${position} at ${company} expired.`,
          date: referralDate,
          type: "danger",
        });
      }

      // Cancelled
      if (status === "cancelled") {
        events.push({
          title: "Cancelled",
          description:
            `Referral for ${position} at ${company} was cancelled.`,
          date: referralDate,
          type: "danger",
        });
      }

      // Reapply Eligible
      if (referral?.reapply_eligible_date) {
        events.push({
          title: "Eligible to Reapply",
          description:
            "Applicant may reapply after the employer cooldown period.",
          date: referral.reapply_eligible_date,
          type: "success",
        });
      }
    });

    return events
      .filter((event) => event.date)
      .sort(
        (a, b) =>
          getDateValue(a.date) -
          getDateValue(b.date)
      );
  }, [applicant, sortedReferrals]);

  // ==========================================================
  // DO NOT RENDER
  // ==========================================================

  if (!isOpen || !applicant) {
    return null;
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/50
        px-3
        py-4
        sm:px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* ====================================================
          MODAL
      ===================================================== */}

      <div
        className="
          flex
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
          max-h-[calc(100vh-2rem)]
          sm:max-h-[calc(100vh-3rem)]"
        onMouseDown={(e) => e.stopPropagation()}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            bg-[#202860]
            px-5
            py-4
            text-white
            sm:px-6"
        >
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              Applicant Profile
            </h2>

            <p className="mt-0.5 text-xs text-[#eef0f8] sm:text-sm">
              Applicant information and employment history
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              text-xl
              font-bold
              text-white
              transition
              hover:bg-white/15
              focus:outline-none"
          >
            ×
          </button>
        </div>

        {/* ==================================================
            SCROLLABLE CONTENT
        ================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-4
            py-4
            sm:px-5
            sm:py-5"
        >

          {/* =================================================
              APPLICANT SUMMARY
          ================================================== */}

          <div
            className="
              mb-5
              flex
              flex-col
              gap-4
              rounded-xl
              bg-[#1b2255]
              p-4
              text-white
              shadow-md
              sm:flex-row
              sm:items-center
              sm:justify-between"
          >
            <div className="min-w-0">
              <h3 className="truncate text-lg font-bold sm:text-xl">
                {applicant.full_name ||
                  "Unnamed Applicant"}
              </h3>

              <p className="truncate text-xs text-[#eef0f8] sm:text-sm">
                {applicant.classification ||
                  "No classification"}
              </p>
            </div>

            <span
              className={`
                w-fit
                shrink-0
                rounded-sm
                px-3
                py-1.5
                text-xs
                font-bold
                ${readinessClass}
              `}
            >
              {readinessLabel}
            </span>
          </div>

          <ApprovalReviewInfo
            approvalStatus={applicant.approval_status}
            rejectionReason={applicant.rejection_reason}
            reviewedBy={applicant.reviewed_by}
            reviewedAt={applicant.reviewed_at}
          />

          {/* =================================================
              PERSONAL INFORMATION
          ================================================== */}

          <section className="mb-5">
            <SectionTitle
              icon={<FaUser />}
              title="Personal Information"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              <InfoCard
                icon={<FaUser />}
                label="Full Name"
                value={applicant.full_name}
              />

              <InfoCard
                icon={<FaPhone />}
                label="Contact Number"
                value={applicant.contact_number}
              />

              <InfoCard
                icon={<FaMapMarkerAlt />}
                label="Address"
                value={applicant.address}
                full
              />

              <InfoCard
                icon={<FaUser />}
                label="Classification"
                value={applicant.classification}
              />

              <InfoCard
                icon={<FaCalendarAlt />}
                label="Registered Date"
                value={formatDate(applicant.created_at)}
              />

            </div>
          </section>

          {/* =================================================
              EDUCATION & EXPERIENCE
          ================================================== */}

          <section className="mb-5">
            <SectionTitle
              icon={<FaGraduationCap />}
              title="Education & Experience"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              <InfoCard
                icon={<FaGraduationCap />}
                label="Education"
                value={applicant.education}
              />

              <InfoCard
                icon={<FaBriefcase />}
                label="Work Experience"
                value={applicant.work_experience}
              />

              <InfoCard
                icon={<FaTools />}
                label="Skills"
                value={applicant.skills}
                full
              />

            </div>
          </section>

          {/* =================================================
              REQUIREMENTS CHECKLIST
          ================================================== */}

          <section className="mb-5">
            <SectionTitle
              icon={<FaFileAlt />}
              title="Requirements Checklist"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {requirements.map((requirement) => {
                const Icon = requirement.icon;

                return (
                  <div
                    key={requirement.label}
                    className="
                      flex
                      items-center
                      justify-between
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      py-3
                      shadow-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Icon className="shrink-0 text-[#202860]" />

                      <span className="truncate text-xs font-semibold text-slate-600">
                        {requirement.label}
                      </span>
                    </div>

                    {requirement.uploaded ? (
                      <span className="ml-2 flex shrink-0 items-center gap-1 text-xs font-semibold text-green-600">
                        <FaCheckCircle />
                        Uploaded
                      </span>
                    ) : (
                      <span className="ml-2 flex shrink-0 items-center gap-1 text-xs font-semibold text-red-500">
                        <FaTimesCircle />
                        Missing
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* =================================================
              READINESS SCORE
          ================================================== */}

          <section className="mb-5">
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle
                icon={<FaChartLine />}
                title="Applicant Readiness Score"
                noMargin
              />

              <span className="text-[11px] text-slate-500 sm:text-xs">
                Automatically calculated
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              <ScoreCard
                label="Profile Completion"
                description="Completeness of applicant profile information."
                score={scores.profile}
              />

              <ScoreCard
                label="Resume Score"
                description="Resume / CV submission status."
                score={scores.resume}
              />

              <ScoreCard
                label="Requirements Score"
                description="Valid ID and Diploma/TOR requirements."
                score={scores.requirements}
              />

              <ScoreCard
                label="Skills Score"
                description="Availability of applicant skills."
                score={scores.skills}
              />

              <ScoreCard
                label="Interview Readiness"
                description="Overall preparedness for employer interviews."
                score={scores.interview}
              />

              {/* OVERALL */}

              <div
                className="
                  rounded-xl
                  border-2
                  border-[#bfc6e2]
                  bg-blue-50
                  p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#161c47]">
                      Overall Job Readiness
                    </p>

                    <p className="mt-1 text-[11px] text-[#202860]">
                      Overall applicant readiness assessment.
                    </p>
                  </div>

                  <span className="text-2xl font-bold text-[#202860]">
                    {scores.overall}%
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-sm bg-[#eef0f8]">
                  <div
                    className="h-full rounded-sm bg-[#202860] transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(0, scores.overall)
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs font-semibold text-[#1b2255]">
                  {readinessLabel}
                </p>
              </div>

            </div>
          </section>          {/* =================================================
              CAREER JOURNEY
          ================================================== */}

          <section className="mb-5">
            <SectionTitle
              icon={<FaExchangeAlt />}
              title="Career Journey"
            />

            {careerJourney.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                <FaInfoCircle className="mx-auto mb-2 text-slate-400" />

                <p className="text-sm text-slate-500">
                  No career journey records available.
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {careerJourney.map((event, index) => {
                  const journeyStyle =
                    getJourneyStatusClass(event.type);

                  const JourneyIcon = journeyStyle.icon;

                  return (
                    <div
                      key={`${event.title}-${event.date}-${index}`}
                      className="flex gap-3"
                    >
                      {/* TIMELINE */}

                      <div className="flex flex-col items-center">
                        <div
                          className={`
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-sm
                            ${journeyStyle.circle}
                          `}
                        >
                          <JourneyIcon className="text-sm" />
                        </div>

                        {index !== careerJourney.length - 1 && (
                          <div
                            className={`
                              mt-1
                              min-h-8
                              w-px
                              flex-1
                              ${journeyStyle.line}
                            `}
                          />
                        )}
                      </div>

                      {/* EVENT DETAILS */}

                      <div className="min-w-0 flex-1 pb-5">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-bold text-slate-800">
                            {event.title}
                          </p>

                          <p className="text-xs text-slate-500">
                            {formatDate(event.date)}
                          </p>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* =================================================
              REFERRAL HISTORY
          ================================================== */}

          <section className="mb-5">
            <SectionTitle
              icon={<FaBriefcase />}
              title="Referral History"
            />

            {loadingReferrals ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />

                <p className="text-sm text-slate-500">
                  Loading referral history...
                </p>
              </div>
            ) : referralError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <FaInfoCircle className="mt-0.5 shrink-0 text-red-500" />

                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Unable to load referral history
                    </p>

                    <p className="mt-1 text-xs text-red-600">
                      {referralError}
                    </p>
                  </div>
                </div>
              </div>
            ) : sortedReferrals.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                <FaExchangeAlt className="mx-auto mb-2 text-slate-400" />

                <p className="text-sm text-slate-500">
                  No referral history available.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedReferrals.map((referral, index) => {
                  const referralStatus =
                    referral?.status || "Pending";

                  return (
                    <div
                      key={
                        referral?.referral_id ||
                        `${referral?.company_name}-${index}`
                      }
                      className="
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        p-4"
                    >
                      {/* REFERRAL HEADER */}

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 shrink-0 text-[#202860]">
                            <FaBuilding className="text-sm" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-800">
                              {referral.company_name ||
                                "Unknown Employer"}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {referral.position_title ||
                                "Unknown Position"}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`
                            w-fit
                            shrink-0
                            rounded-sm
                            px-2.5
                            py-1
                            text-[11px]
                            font-semibold
                            ${getStatusClass(
                              referralStatus
                            )}
                          `}
                        >
                          {referralStatus}
                        </span>
                      </div>

                      {/* REFERRAL DETAILS */}

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <MiniDetail
                          icon={<FaCalendarAlt />}
                          label="Date Referred"
                          value={formatDate(
                            referral.date_referred
                          )}
                        />

                        <MiniDetail
                          icon={<FaCalendarAlt />}
                          label="Interview Date"
                          value={formatDate(
                            referral.interview_date
                          )}
                        />

                        <MiniDetail
                          icon={<FaMapMarkerAlt />}
                          label="Location"
                          value={referral.location}
                        />

                        <MiniDetail
                          icon={<FaClock />}
                          label="Employment Type"
                          value={
                            referral.employment_type
                          }
                        />

                        <MiniDetail
                          icon={<FaCommentDots />}
                          label="Result"
                          value={referral.result}
                        />

                        <MiniDetail
                          icon={<FaTimesCircle />}
                          label="Rejection Reason"
                          value={
                            referral.rejection_reason
                          }
                        />

                        <MiniDetail
                          icon={<FaBell />}
                          label="Next Follow-up"
                          value={formatDate(
                            referral.next_follow_up
                          )}
                        />

                        <MiniDetail
                          icon={<FaRedoAlt />}
                          label="Eligible to Reapply"
                          value={formatDate(
                            referral.reapply_eligible_date
                          )}
                        />
                      </div>

                      {/* FOLLOW-UP INFORMATION */}

                      {(referral.date_contacted ||
                        referral.contacted_person ||
                        referral.contact_method ||
                        referral.follow_up_result) && (
                        <div className="mt-4 border-t border-slate-200 pt-4">
                          <div className="mb-3 flex items-center gap-2">
                            <FaBell className="text-[#202860]" />

                            <p className="text-sm font-semibold text-slate-700">
                              Follow-up Information
                            </p>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <MiniDetail
                              icon={<FaCalendarAlt />}
                              label="Date Contacted"
                              value={formatDate(
                                referral.date_contacted
                              )}
                            />

                            <MiniDetail
                              icon={<FaUser />}
                              label="Contacted Person"
                              value={
                                referral.contacted_person
                              }
                            />

                            <MiniDetail
                              icon={<FaPhone />}
                              label="Contact Method"
                              value={
                                referral.contact_method
                              }
                            />

                            <MiniDetail
                              icon={<FaBell />}
                              label="Follow-up Result"
                              value={
                                referral.follow_up_result
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* =================================================
              PESO ASSESSMENT
          ================================================== */}

          <section className="mb-2">
            <SectionTitle
              icon={<FaCommentDots />}
              title="PESO Assessment / Comment"
            />

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              {applicant.peso_comment ? (
                <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                  {applicant.peso_comment}
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <FaInfoCircle className="text-slate-400" />

                  <p className="text-sm italic text-slate-400">
                    No PESO assessment or comment provided.
                  </p>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div
          className="
            flex
            shrink-0
            justify-end
            border-t
            border-slate-200
            bg-white
            px-4
            py-4
            sm:px-5"
        >
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              border
              border-slate-300
              bg-white
              px-5
              py-2.5
              text-sm
              font-semibold
              text-slate-700
              transition
              hover:bg-slate-50
              focus:outline-none
              focus:ring-2
              focus:ring-[#202860]
              focus:ring-offset-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   SECTION TITLE
========================================================== */

function SectionTitle({
  icon,
  title,
  noMargin = false,
}) {
  return (
    <div
      className={`
        flex
        items-center
        gap-2
        border-b
        border-slate-200
        pb-2
        ${noMargin ? "" : "mb-4"}
      `}
    >
      <span className="text-[#202860]">
        {icon}
      </span>

      <h3 className="text-base font-bold text-slate-800">
        {title}
      </h3>
    </div>
  );
}

/* ==========================================================
   INFO CARD
========================================================== */

function InfoCard({
  icon,
  label,
  value,
  full = false,
}) {
  const displayValue =
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
      ? value
      : "Not specified";

  return (
    <div
      className={`
        rounded-xl
        border
        border-slate-200
        bg-slate-50
        p-4
        ${full ? "sm:col-span-2" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="text-[#202860]">
          {icon}
        </span>

        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-2 break-words text-sm font-medium text-slate-700">
        {displayValue}
      </p>
    </div>
  );
}

/* ==========================================================
   SCORE CARD
========================================================== */

function ScoreCard({
  label,
  description,
  score,
}) {
  const safeScore = Math.min(
    100,
    Math.max(0, Number(score) || 0)
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">
            {label}
          </p>

          <p className="mt-1 text-[11px] leading-4 text-slate-500">
            {description}
          </p>
        </div>

        <span className="shrink-0 text-lg font-bold text-[#202860]">
          {safeScore}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-sm bg-slate-200">
        <div
          className="h-full rounded-sm bg-[#202860] transition-all"
          style={{
            width: `${safeScore}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ==========================================================
   MINI DETAIL
========================================================== */

function MiniDetail({
  icon,
  label,
  value,
}) {
  const displayValue =
    value !== null &&
    value !== undefined &&
    String(value).trim() !== ""
      ? value
      : "Not specified";

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="shrink-0 text-[#202860]">
            {icon}
          </span>
        )}

        <p className="text-[11px] font-semibold text-slate-500">
          {label}
        </p>
      </div>

      <p className="mt-1 break-words text-xs font-medium text-slate-700">
        {displayValue}
      </p>
    </div>
  );
}