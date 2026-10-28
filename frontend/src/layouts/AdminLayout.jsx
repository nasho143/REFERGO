import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BackToTop from "./BackToTop";

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Collapse the mobile menu whenever the page changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Office masthead, date and time, notifications, signed-in user */}
      <Navbar />

      {/* Primary navigation */}
      <Sidebar
        open={menuOpen}
        onToggle={() => setMenuOpen((prev) => !prev)}
        onClose={() => setMenuOpen(false)}
      />

      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-4 sm:px-6 lg:py-5">
        <Outlet key={`${location.pathname}${location.search}`} />
      </main>

      <BackToTop />

      <footer className="gov-footer">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-0.5 px-4 py-1.5 text-[12px] sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            <span className="font-semibold text-white">
              Public Employment Service Office
            </span>{" "}
            &middot; Municipality of Mendez, Cavite
          </p>
          <p>
            REFERGO &middot; &copy; {year} PESO Mendez
          </p>
        </div>
      </footer>
    </div>
  );
}
