import {
  FaClipboardCheck,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
  FaClock,
  FaHourglassHalf,
} from "react-icons/fa";

// ======================================================
// MONITORING CARD
// ======================================================

function MonitoringCard({
  title,
  value,
  description,
  icon,
  iconBg,
  iconColor,
  numberColor,
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">

        {/* Icon */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>

        {/* Number */}
        <span
          className={`text-3xl font-extrabold leading-none tracking-tight ${numberColor}`}
        >
          {Number(value) || 0}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-5 text-base font-bold text-slate-800">
        {title}
      </h3>

      {/* Description */}
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function EmployerResponseMonitoring({
  data = {},
}) {
  const totalReferrals =
    Number(data.totalReferrals) || 0;

  const interviewed =
    Number(data.interviewed) || 0;

  const hired =
    Number(data.hired) || 0;

  const rejected =
    Number(data.rejected) || 0;

  const pending =
    Number(data.pending) || 0;

  const awaitingEmployerResponse =
    Number(
      data.awaitingEmployerResponse
    ) || 0;

  return (
    <section className="space-y-4">

      {/* ==================================================
          SECTION HEADER
      ================================================== */}

      <div className="flex items-center gap-3">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <FaClipboardCheck className="text-lg" />
        </div>

        <div className="min-w-0">

          <h2 className="text-xl font-bold text-slate-800">
            Employer Response Monitoring
          </h2>

          <p className="text-sm text-slate-500">
            Monitor referral progress and employer responses.
          </p>

        </div>

      </div>

      {/* ==================================================
          MONITORING CARDS
      ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">

        {/* TOTAL REFERRALS */}
        <MonitoringCard
          title="Total Referrals"
          value={totalReferrals}
          description={
            totalReferrals === 0
              ? "No referrals have been recorded yet."
              : "Total employment referrals recorded in the system."
          }
          icon={<FaUsers />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          numberColor="text-blue-700"
        />

        {/* INTERVIEWED */}
        <MonitoringCard
          title="Interviewed"
          value={interviewed}
          description={
            interviewed === 0
              ? "No completed interviews have been recorded."
              : "Applicants with a recorded interview date."
          }
          icon={<FaClipboardCheck />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          numberColor="text-purple-700"
        />

        {/* HIRED */}
        <MonitoringCard
          title="Hired"
          value={hired}
          description={
            hired === 0
              ? "No successful employment outcomes recorded."
              : "Applicants who were successfully hired."
          }
          icon={<FaUserCheck />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          numberColor="text-green-700"
        />

        {/* REJECTED */}
        <MonitoringCard
          title="Rejected"
          value={rejected}
          description={
            rejected === 0
              ? "No rejected referrals recorded."
              : "Referrals that resulted in rejection."
          }
          icon={<FaUserTimes />}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          numberColor="text-red-700"
        />

        {/* PENDING */}
        <MonitoringCard
          title="Pending"
          value={pending}
          description={
            pending === 0
              ? "No referrals are currently pending."
              : "Referrals still awaiting further action."
          }
          icon={<FaClock />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          numberColor="text-amber-700"
        />

        {/* AWAITING EMPLOYER RESPONSE */}
        <MonitoringCard
          title="Awaiting Employer Response"
          value={
            awaitingEmployerResponse
          }
          description={
            awaitingEmployerResponse === 0
              ? "No referrals are currently awaiting employer response."
              : "Referrals where employer feedback or response is still pending."
          }
          icon={<FaHourglassHalf />}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          numberColor="text-orange-700"
        />

      </div>
    </section>
  );
}