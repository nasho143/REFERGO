import { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BackToTop from "./BackToTop";
import { pageTitles } from "./pageTitles";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Collapse the mobile menu whenever the page changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const pageTitle = pageTitles[location.pathname];
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Republic strip + office masthead + signed-in user */}
      <Navbar />

      {/* Primary navigation */}
      <Sidebar
        open={menuOpen}
        onToggle={() => setMenuOpen((prev) => !prev)}
        onClose={() => setMenuOpen(false)}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="gov-crumbs">
        <div className="mx-auto flex w-full max-w-[1240px] items-center gap-2 px-4 py-2.5 sm:px-6">
          <Link to="/dashboard" className="text-blue-600 underline">
            Home
          </Link>
          {pageTitle && pageTitle !== "Dashboard" && (
            <>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="font-semibold text-slate-800">
                {pageTitle}
              </span>
            </>
          )}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-4 py-7 sm:px-6 lg:py-9">
        <Outlet />
      </main>

      <BackToTop />

      <footer className="gov-footer">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-1 px-4 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <p className="font-semibold text-white">
              Public Employment Service Office
            </p>
            <p>Municipality of Mendez, Cavite</p>
          </div>
          <div className="sm:text-right">
            <p>REFERGO Employment Referral Management System</p>
            <p>For authorized personnel. System activity is recorded.</p>
            <p>&copy; {year} PESO Mendez</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
