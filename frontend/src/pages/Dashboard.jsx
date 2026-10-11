import { useEffect, useState } from "react";

import LoadingSpinner from "../components/common/LoadingSpinner";
import Button from "../components/common/Button";

import { getDashboard } from "../services/dashboardApi";

import DashboardHero from "../components/dashboard/DashboardHero";
import DashboardCards from "../components/dashboard/DashboardCards";
import DashboardAlerts from "../components/dashboard/DashboardAlerts";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import RecentReferrals from "../components/dashboard/RecentReferrals";
import RecentActivity from "../components/dashboard/RecentActivity";
import EmployerResponseMonitoring from "../components/dashboard/EmployerResponseMonitoring";
import PendingApprovals from "../components/dashboard/PendingApprovals";
import ApprovalOverview from "../components/dashboard/ApprovalOverview";
import PendingApprovalTable from "../components/dashboard/PendingApprovalTable";

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    applicants: 0,
    employers: 0,
    vacancies: 0,
    referrals: 0,
    activeVacancies: 0,

    role: "peso_staff",

    pendingApprovals: {
      applicants: 0,
      employers: 0,
      vacancies: 0,
      referrals: 0,
      total: 0,
    },

    approvalSummary: {
      pending: 0,
      approved: 0,
      rejected: 0,
    },

    pendingApprovalRecords: [],

    status: [],

    recentReferrals: [],

    employerResponse: {
      totalReferrals: 0,
      interviewed: 0,
      hired: 0,
      rejected: 0,
      pending: 0,
      awaitingEmployerResponse: 0,
    },

    alerts: {
      followUps: 0,
      expiringVacancies: 0,
      incompleteApplicants: 0,
      interviewsThisWeek: 0,
      hiredThisMonth: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD DASHBOARD
  // ======================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Loading dashboard...");

      const response = await getDashboard();

      console.log(
        "DASHBOARD RESPONSE:",
        response?.data
      );

      const responseData =
        response?.data || {};

      /*
       * Supports both:
       *
       * response.data
       *
       * and:
       *
       * response.data.data
       *
       * This keeps compatibility with the existing API.
       */

      const data =
        responseData.data ||
        responseData;

      // ====================================================
      // EMPLOYER RESPONSE DATA
      // ====================================================

      const employerResponse =
        data.employerResponse || {};

      // ====================================================
      // DASHBOARD DATA
      // ====================================================

      setDashboardData({
        role: String(data.role || "peso_staff").trim().toLowerCase(),

        pendingApprovals: {
          applicants: Number(data.pendingApprovals?.applicants) || 0,
          employers: Number(data.pendingApprovals?.employers) || 0,
          vacancies: Number(data.pendingApprovals?.vacancies) || 0,
          referrals: Number(data.pendingApprovals?.referrals) || 0,
          total: Number(data.pendingApprovals?.total) || 0,
        },

        approvalSummary: {
          pending: Number(data.approvalSummary?.pending) || 0,
          approved: Number(data.approvalSummary?.approved) || 0,
          rejected: Number(data.approvalSummary?.rejected) || 0,
        },

        pendingApprovalRecords: Array.isArray(data.pendingApprovalRecords)
          ? data.pendingApprovalRecords
          : [],

        applicants:
          Number(data.applicants) || 0,

        employers:
          Number(data.employers) || 0,

        vacancies:
          Number(data.vacancies) || 0,

        referrals:
          Number(data.referrals) || 0,

        activeVacancies:
          Number(data.activeVacancies) || 0,

        // ==================================================
        // REFERRAL STATUS
        // ==================================================

        status:
          Array.isArray(data.status)
            ? data.status
            : [],

        // ==================================================
        // RECENT REFERRALS
        // ==================================================

        recentReferrals:
          Array.isArray(
            data.recentReferrals
          )
            ? data.recentReferrals
            : Array.isArray(
                data.recent_referrals
              )
            ? data.recent_referrals
            : [],

        // ==================================================
        // EMPLOYER RESPONSE MONITORING
        // ==================================================

        employerResponse: {
          totalReferrals:
            Number(
              employerResponse.totalReferrals
            ) || 0,

          interviewed:
            Number(
              employerResponse.interviewed
            ) || 0,

          hired:
            Number(
              employerResponse.hired
            ) || 0,

          rejected:
            Number(
              employerResponse.rejected
            ) || 0,

          pending:
            Number(
              employerResponse.pending
            ) || 0,

          awaitingEmployerResponse:
            Number(
              employerResponse.awaitingEmployerResponse
            ) || 0,
        },

        // ==================================================
        // DASHBOARD ALERTS
        // ==================================================

        alerts: {
          followUps:
            Number(
              data.alerts?.followUps
            ) || 0,

          expiringVacancies:
            Number(
              data.alerts?.expiringVacancies
            ) || 0,

          incompleteApplicants:
            Number(
              data.alerts?.incompleteApplicants
            ) || 0,

          interviewsThisWeek:
            Number(
              data.alerts?.interviewsThisWeek
            ) || 0,

          hiredThisMonth:
            Number(
              data.alerts?.hiredThisMonth
            ) || 0,
        },
      });

    } catch (err) {

      console.error(
        "DASHBOARD LOADING ERROR:",
        err
      );

      console.error(
        "DASHBOARD ERROR RESPONSE:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load dashboard data."
      );

    } finally {

      setLoading(false);

    }
  };

  // ======================================================
  // LOAD DASHBOARD ON PAGE LOAD
  // ======================================================

  useEffect(() => {
    loadDashboard();
  }, []);

  // ======================================================
  // LOADING STATE
  // ======================================================

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  // ======================================================
  // ERROR STATE
  // ======================================================

  if (error) {
    return (
      <div role="alert" className="mx-auto mt-6 max-w-lg border border-red-600 bg-white">
        <h2 className="border-b border-red-600 bg-red-50 px-5 py-2.5 !text-base !text-red-700">
          Unable to load dashboard
        </h2>
        <div className="px-5 py-4">
          <p className="text-slate-800">{error}</p>
          <Button className="mt-4" onClick={loadDashboard}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // ======================================================
  // DASHBOARD CONTENT
  // ======================================================

  return (
    <div className="space-y-6">

      {/* ================================================
          DASHBOARD HERO
      ================================================= */}

      <DashboardHero />

      {/* ================================================
          MAIN STATISTICS
      ================================================= */}

      <DashboardCards
        applicants={
          dashboardData.applicants
        }

        employers={
          dashboardData.employers
        }

        vacancies={
          dashboardData.vacancies
        }

        referrals={
          dashboardData.referrals
        }
      />

      {/* ================================================
          DEPARTMENT HEAD APPROVAL WORKFLOW
      ================================================= */}

      {dashboardData.role === "department_head" && (
        <>
          <PendingApprovals
            data={dashboardData.pendingApprovals}
          />

          <ApprovalOverview
            summary={dashboardData.approvalSummary}
            pendingTotal={dashboardData.pendingApprovals.total}
          />

          <PendingApprovalTable
            records={dashboardData.pendingApprovalRecords}
          />
        </>
      )}

      {/* ================================================
          OPERATIONAL ALERTS
      ================================================= */}

      <DashboardAlerts
        alerts={dashboardData.alerts}
      />

      {/* ================================================
          EMPLOYER RESPONSE MONITORING
      ================================================= */}

      <EmployerResponseMonitoring
        data={dashboardData.employerResponse}
      />

      {/* ================================================
          REFERRAL ANALYTICS
      ================================================= */}

      <DashboardCharts
        status={dashboardData.status}
      />

      {/* ================================================
          RECENT REFERRALS
      ================================================= */}

      <RecentReferrals
        referrals={dashboardData.recentReferrals}
      />

      {/* ================================================
          RECENT ACTIVITY
      ================================================= */}

      <RecentActivity />

    </div>
  );
}