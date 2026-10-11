export default function DashboardHero() {
  const storedUser = localStorage.getItem("user");
  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("INVALID USER DATA:", error);
  }

  const fullName = user?.full_name || "User";
  const roleLabel =
    user?.role === "department_head" ? "Department Head" : "PESO Staff";

  return (
    <section aria-labelledby="dashboard-title">
      <h1 id="dashboard-title">Dashboard</h1>
      <p className="mt-1 text-slate-700">
        Welcome, <strong>{fullName}</strong> ({roleLabel}). Manage applicant,
        employer, vacancy, and employment referral records through the REFERGO
        system.
      </p>
    </section>
  );
}
