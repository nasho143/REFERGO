import {
  FaUser,
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardCheck,
  FaPhone,
  FaUserTie,
  FaCommentAlt,
  FaClock,
} from "react-icons/fa";

export default function ReferralForm({
  form,
  applicants = [],
  vacancies = [],
  handleChange,
}) {
  const applicantList = Array.isArray(applicants)
    ? applicants
    : [];

  const vacancyList = Array.isArray(vacancies)
    ? vacancies
    : [];

  const selectedVacancy = vacancyList.find(
    (vacancy) =>
      Number(vacancy.vacancy_id) ===
      Number(form?.vacancy_id)
  );

  const selectedApplicant = applicantList.find(
    (applicant) =>
      Number(applicant.applicant_id) ===
      Number(form?.applicant_id)
  );

  const status = form?.status || "Pending";

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 transition focus:border-[#202860] focus:outline-none focus:ring-2 focus:ring-[#bfc6e2]";

  const readOnlyClass =
    "w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600 focus:outline-none";

  const labelClass =
    "mb-2.5 flex items-center gap-2.5 text-sm font-semibold text-slate-800";

  const isRejected =
    status === "Rejected" || status === "Failed";

  return (
    <div className="space-y-10">

      {/* =====================================================
          1. REFERRAL INFORMATION
          NOTE:
          SectionHeader removed here because ReferralModal
          already displays the Referral Information heading.
      ===================================================== */}
      <section>
        <div className="grid grid-cols-1 gap-x-6 gap-y-7 md:grid-cols-2">

          {/* =================================================
              APPLICANT
          ================================================== */}
          <div className="md:col-span-2">
            <label className={labelClass}>
              <FaUser className="text-[#202860]" />
              Applicant
            </label>

            <select
              name="applicant_id"
              value={form?.applicant_id || ""}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">
                Select Applicant
              </option>

              {applicantList.map((applicant) => (
                <option
                  key={applicant.applicant_id}
                  value={applicant.applicant_id}
                >
                  {applicant.full_name ||
                    "Unnamed Applicant"}

                  {applicant.classification
                    ? ` — ${applicant.classification}`
                    : ""}
                </option>
              ))}
            </select>

            {selectedApplicant && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">

                {selectedApplicant.classification && (
                  <span>
                    Classification:{" "}
                    <strong className="text-slate-700">
                      {selectedApplicant.classification}
                    </strong>
                  </span>
                )}

                {selectedApplicant.contact_number && (
                  <span>
                    Contact:{" "}
                    <strong className="text-slate-700">
                      {selectedApplicant.contact_number}
                    </strong>
                  </span>
                )}

              </div>
            )}
          </div>

          {/* =================================================
              JOB VACANCY
          ================================================== */}
          <div className="md:col-span-2">
            <label className={labelClass}>
              <FaBriefcase className="text-[#202860]" />
              Job Vacancy
            </label>

            <select
              name="vacancy_id"
              value={form?.vacancy_id || ""}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">
                Select Job Vacancy
              </option>

              {vacancyList.map((vacancy) => (
                <option
                  key={vacancy.vacancy_id}
                  value={vacancy.vacancy_id}
                >
                  {vacancy.position_title ||
                    "Untitled Position"}

                  {vacancy.company_name
                    ? ` — ${vacancy.company_name}`
                    : ""}
                </option>
              ))}
            </select>

            {selectedVacancy && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">

                {selectedVacancy.employment_type && (
                  <span>
                    Type:{" "}
                    <strong className="text-slate-700">
                      {selectedVacancy.employment_type}
                    </strong>
                  </span>
                )}

                {selectedVacancy.location && (
                  <span>
                    Location:{" "}
                    <strong className="text-slate-700">
                      {selectedVacancy.location}
                    </strong>
                  </span>
                )}

              </div>
            )}
          </div>

          {/* =================================================
              EMPLOYER
          ================================================== */}
          <div>
            <label className={labelClass}>
              <FaBuilding className="text-[#202860]" />
              Employer
            </label>

            <input
              type="text"
              value={
                selectedVacancy?.company_name || ""
              }
              readOnly
              placeholder="Automatically selected"
              className={readOnlyClass}
            />
          </div>

          {/* =================================================
              POSITION
          ================================================== */}
          <div>
            <label className={labelClass}>
              <FaBriefcase className="text-[#202860]" />
              Position
            </label>

            <input
              type="text"
              value={
                selectedVacancy?.position_title || ""
              }
              readOnly
              placeholder="Automatically selected"
              className={readOnlyClass}
            />
          </div>

          {/* =================================================
              DATE REFERRED
          ================================================== */}
          <div>
            <label className={labelClass}>
              <FaCalendarAlt className="text-[#202860]" />
              Date Referred
            </label>

            <input
              type="date"
              name="date_referred"
              value={form?.date_referred || ""}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* =================================================
              STATUS
          ================================================== */}
          <div>
            <label className={labelClass}>
              <FaCheckCircle className="text-[#202860]" />
              Status
            </label>

            <select
              name="status"
              value={status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Pending">
                Pending
              </option>

              <option value="For Interview">
                For Interview
              </option>

              <option value="Interview Scheduled">
                Interview Scheduled
              </option>

              <option value="Hired">
                Hired
              </option>

              <option value="Rejected">
                Rejected
              </option>

              <option value="Failed">
                Failed
              </option>

              <option value="No Response">
                No Response
              </option>

              <option value="Expired">
                Expired
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>
          </div>

        </div>
      </section>

      {/* =====================================================
          2. INTERVIEW & OUTCOME
      ===================================================== */}
      <section>
        <SectionHeader
          title="Interview & Outcome"
          description="Record interview details and employment results."
          icon={<FaClipboardCheck />}
        />

        <div className="grid grid-cols-1 gap-x-6 gap-y-7 md:grid-cols-2">

          {/* Interview Date */}
          <div>
            <label className={labelClass}>
              <FaCalendarAlt className="text-[#202860]" />
              Interview Date
            </label>

            <input
              type="date"
              name="interview_date"
              value={form?.interview_date || ""}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Result */}
          <div>
            <label className={labelClass}>
              <FaClipboardCheck className="text-[#202860]" />
              Result
            </label>

            <input
              type="text"
              name="result"
              value={form?.result || ""}
              onChange={handleChange}
              placeholder="e.g. Passed, Hired, For Evaluation"
              className={inputClass}
            />
          </div>

          {/* Rejection Reason */}
          {isRejected && (
            <div className="md:col-span-2">
              <label className={labelClass}>
                <FaCommentAlt className="text-[#202860]" />
                Rejection Reason
              </label>

              <select
                name="rejection_reason"
                value={
                  form?.rejection_reason || ""
                }
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  Select Rejection Reason
                </option>

                <option value="Did not meet qualifications">
                  Did not meet qualifications
                </option>

                <option value="Failed interview">
                  Failed interview
                </option>

                <option value="Position filled">
                  Position filled
                </option>

                <option value="Applicant withdrew">
                  Applicant withdrew
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>
          )}

          {/* Reapplication Date */}
          {isRejected &&
            form?.reapply_eligible_date && (
              <div className="md:col-span-2">

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                  <div className="flex items-start gap-3">

                    <FaClock className="mt-1 shrink-0 text-amber-600" />

                    <div>

                      <p className="text-sm font-semibold text-amber-800">
                        Reapplication Eligibility
                      </p>

                      <p className="mt-1 text-sm text-amber-700">
                        This applicant may reapply on{" "}
                        <strong>
                          {formatDate(
                            form.reapply_eligible_date
                          )}
                        </strong>
                        .
                      </p>

                      <p className="mt-1 text-xs text-amber-600">
                        This date is calculated automatically
                        based on the employer's reapplication
                        policy.
                      </p>

                    </div>

                  </div>

                </div>

              </div>
            )}

        </div>
      </section>

      {/* =====================================================
          3. FOLLOW-UP & EMPLOYER RESPONSE
      ===================================================== */}
      <section>
        <SectionHeader
          title="Follow-up & Employer Response"
          description="Record employer communication and follow-up activity."
          icon={<FaCommentAlt />}
        />

        <div className="grid grid-cols-1 gap-x-6 gap-y-7 md:grid-cols-2">

          {/* Date Contacted */}
          <div>
            <label className={labelClass}>
              <FaCalendarAlt className="text-[#202860]" />
              Date Contacted
            </label>

            <input
              type="date"
              name="date_contacted"
              value={
                form?.date_contacted || ""
              }
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Contacted Person */}
          <div>
            <label className={labelClass}>
              <FaUserTie className="text-[#202860]" />
              Contacted Person
            </label>

            <input
              type="text"
              name="contacted_person"
              value={
                form?.contacted_person || ""
              }
              onChange={handleChange}
              placeholder="Employer representative"
              className={inputClass}
            />
          </div>

          {/* Contact Method */}
          <div>
            <label className={labelClass}>
              <FaPhone className="text-[#202860]" />
              Contact Method
            </label>

            <select
              name="contact_method"
              value={
                form?.contact_method || ""
              }
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">
                Select Contact Method
              </option>

              <option value="Phone Call">
                Phone Call
              </option>

              <option value="Email">
                Email
              </option>

              <option value="SMS">
                SMS
              </option>

              <option value="In Person">
                In Person
              </option>

              <option value="Messenger">
                Messenger
              </option>

              <option value="Other">
                Other
              </option>
            </select>
          </div>

          {/* Next Follow-up */}
          <div>
            <label className={labelClass}>
              <FaClock className="text-[#202860]" />
              Next Follow-up
            </label>

            <input
              type="date"
              name="next_follow_up"
              value={
                form?.next_follow_up || ""
              }
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Follow-up Result */}
          <div className="md:col-span-2">
            <label className={labelClass}>
              <FaCommentAlt className="text-[#202860]" />
              Follow-up Result
            </label>

            <textarea
              name="follow_up_result"
              value={
                form?.follow_up_result || ""
              }
              onChange={handleChange}
              rows={4}
              placeholder="Enter employer response, follow-up notes, or next action..."
              className={`${inputClass} resize-none`}
            />
          </div>

        </div>
      </section>

    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  description,
  icon,
}) {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-slate-300 pb-3">


      <div className="min-w-0">

        <h3 className="text-lg font-bold text-slate-800">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>

      </div>

    </div>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const dateString = String(value).substring(0, 10);
  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return dateString;
  }

  return `${parts[1]}/${parts[2]}/${parts[0]}`;
}