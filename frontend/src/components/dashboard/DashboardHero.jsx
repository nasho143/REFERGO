import {
  FaUsers,
  FaBuilding,
  FaBriefcase,
  FaExchangeAlt,
} from "react-icons/fa";

export default function DashboardHero() {
  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("INVALID USER DATA:", error);
    user = null;
  }

  // ==========================================
  // DYNAMIC GREETING
  // ==========================================

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  // ==========================================
  // USER NAME
  // ==========================================

  const fullName = user?.full_name || "User";

  // ==========================================
  // USER ROLE
  // ==========================================

  let roleLabel = "PESO Staff";

  if (user?.role === "department_head") {
    roleLabel = "Department Head";
  } else if (user?.role === "peso_staff") {
    roleLabel = "PESO Staff";
  }

  // ==========================================
  // TODAY'S DATE
  // ==========================================

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-10 text-white shadow-xl">

      {/* Decorative background */}
      <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>

      <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row">

        {/* ==========================================
            GREETING
        ========================================== */}

        <div>

          <p className="uppercase tracking-[3px] text-blue-100">
            REFERGO Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
            {greeting}, {fullName}!
          </h1>

          <p className="mt-2 text-base font-medium text-blue-100">
            {roleLabel}
          </p>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-100">
            {user?.role === "department_head"
              ? "Review pending submissions, monitor approvals, and oversee employment referral operations."
              : "Monitor applicants, employers, vacancies, referrals, and daily employment referral operations."}
          </p>

        </div>

        {/* ==========================================
            DATE
        ========================================== */}

        <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-md">

          <p className="text-blue-100">
            Today's Date
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            {today}
          </h2>

        </div>

      </div>

      {/* ==========================================
          MODULE OVERVIEW
      ========================================== */}

      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">

        <HeroItem
          icon={<FaUsers />}
          title="Applicants"
        />

        <HeroItem
          icon={<FaBuilding />}
          title="Employers"
        />

        <HeroItem
          icon={<FaBriefcase />}
          title="Vacancies"
        />

        <HeroItem
          icon={<FaExchangeAlt />}
          title="Referrals"
        />

      </div>

    </div>
  );
}

function HeroItem({ icon, title }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5 text-center backdrop-blur-md transition hover:bg-white/20">

      <div className="mb-3 flex justify-center text-3xl">
        {icon}
      </div>

      <p>{title}</p>

    </div>
  );
}