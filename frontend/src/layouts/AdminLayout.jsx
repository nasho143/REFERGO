import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100">

      {/* ======================================
          MOBILE OVERLAY
      ====================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            lg:hidden
          "
        />
      )}

      {/* ======================================
          SIDEBAR
      ====================================== */}

      <Sidebar
        sidebarOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <div
        className="
          min-h-screen
          w-full
          lg:ml-72
          lg:w-[calc(100%-18rem)]
        "
      >

        {/* ====================================
            NAVBAR
        ==================================== */}

        <Navbar
          onMenuClick={handleMenuClick}
        />

        {/* ====================================
            PAGE CONTENT
        ==================================== */}

        <main
          className="
            w-full
            px-4
            pb-6
            pt-24
            sm:px-5
            lg:px-6
            lg:pt-28
          "
        >
          <Outlet />
        </main>

      </div>

    </div>
  );
}