import { Link } from "react-router-dom";
import { linkTo } from "../../utils/quickFilter";
import {
  FaUserFriends,
  FaBuilding,
  FaBriefcase,
  FaExchangeAlt,
  FaArrowRight,
} from "react-icons/fa";

// Each card is a shortcut: click it to open that module's records.
function Kpi({ to, icon, title, value, detail, accent }) {
  return (
    <Link
      to={to}
      aria-label={`${title}: ${value}. Open ${title}.`}
      className="group flex flex-col justify-between border border-slate-300 bg-white p-4 no-underline hover:border-blue-600 hover:bg-blue-50"
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600">{title}</span>
        <span aria-hidden="true" className="text-[#202860]">
          {icon}
        </span>
      </div>

      <p className="mt-2 font-serif text-[32px] font-bold leading-none text-blue-600">
        {Number(value) || 0}
      </p>

      <div className="mt-2 flex items-center justify-between text-[12.5px] text-slate-600">
        <span>{detail}</span>
        <FaArrowRight
          aria-hidden="true"
          className="text-[11px] text-slate-400 group-hover:text-blue-600"
        />
      </div>
    </Link>
  );
}

export default function DashboardCards({
  period = null,
  applicants = 0,
  employers = 0,
  vacancies = 0,
  referrals = 0,
  readyApplicants = 0,
  approvedEmployers = 0,
  activeVacancies = 0,
  hiredReferrals = 0,
}) {
  return (
    <section
      aria-label="Summary of records"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
    >
      <Kpi
        to={linkTo("/applicants", {}, period)}
        icon={<FaUserFriends />}
        title="Applicants"
        value={applicants}
        detail={`${readyApplicants} ready for referral`}
        accent="#202860"
      />
      <Kpi
        to={linkTo("/employers", {}, period)}
        icon={<FaBuilding />}
        title="Employers"
        value={employers}
        detail={`${approvedEmployers} approved`}
        accent="#3a4789"
      />
      <Kpi
        to={linkTo("/vacancies", {}, period)}
        icon={<FaBriefcase />}
        title="Job Vacancies"
        value={vacancies}
        detail={`${activeVacancies} active`}
        accent="#c9a800"
      />
      <Kpi
        to={linkTo("/referrals", {}, period)}
        icon={<FaExchangeAlt />}
        title="Referrals"
        value={referrals}
        detail={`${hiredReferrals} hired`}
        accent="#e01838"
      />
    </section>
  );
}
