import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// ======================================
// LAYOUT
// ======================================
import AdminLayout from "./layouts/AdminLayout";

// ======================================
// PAGES
// ======================================
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employers from "./pages/Employers";
import Vacancies from "./pages/Vacancies";
import Applicants from "./pages/Applicants";
import Referrals from "./pages/Referrals";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import ActivityLogs from "./pages/ActivityLogs";
import UserManagement from "./pages/UserManagement";

// ======================================
// PROTECTED ROUTE
// ======================================
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ======================================
// DEPARTMENT HEAD ONLY ROUTE
// ======================================
function DepartmentHeadRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("user")
    );
  } catch (error) {
    user = null;
  }

  if (user?.role !== "department_head") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ======================================
// APP
// ======================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================================
            LOGIN
        ================================== */}

        <Route
          path="/login"
          element={<Login />}
        />


        {/* ==================================
            PROTECTED ADMIN AREA
        ================================== */}

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          {/* ==================================
              DASHBOARD
          ================================== */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* ==================================
              EMPLOYERS
          ================================== */}

          <Route
            path="/employers"
            element={<Employers />}
          />


          {/* ==================================
              JOB VACANCIES
          ================================== */}

          <Route
            path="/vacancies"
            element={<Vacancies />}
          />


          {/* ==================================
              APPLICANTS
          ================================== */}

          <Route
            path="/applicants"
            element={<Applicants />}
          />


          {/* ==================================
              REFERRALS
          ================================== */}

          <Route
            path="/referrals"
            element={<Referrals />}
          />


          {/* ==================================
              REPORTS
          ================================== */}

          <Route
            path="/reports"
            element={<Reports />}
          />


          {/* ==================================
              PROFILE
          ================================== */}

          <Route
            path="/profile"
            element={<Profile />}
          />


          {/* ==================================
              CHANGE PASSWORD
          ================================== */}

          <Route
            path="/change-password"
            element={<ChangePassword />}
          />


          {/* ==================================
              ACTIVITY LOGS
          ================================== */}

          <Route
            path="/activity-logs"
            element={
              <DepartmentHeadRoute>
                <ActivityLogs />
              </DepartmentHeadRoute>
            }
          />


          {/* ==================================
              USER MANAGEMENT
              DEPARTMENT HEAD ONLY
          ================================== */}

          <Route
            path="/users"
            element={
              <DepartmentHeadRoute>
                <UserManagement />
              </DepartmentHeadRoute>
            }
          />

        </Route>


        {/* ==================================
            DEFAULT ROUTE
        ================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* ==================================
            INVALID ROUTE
        ================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}