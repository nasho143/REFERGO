import { useEffect, useState } from "react";

import { getReports } from "../services/reportApi";

import ReportCards from "../components/reports/ReportCards";
import ReportCharts from "../components/reports/ReportCharts";
import ExportButtons from "../components/reports/ExportButtons";

export default function Reports() {
  const [reportData, setReportData] = useState({
    applicants: 0,
    employers: 0,
    vacancies: 0,
    activeVacancies: 0,
    referrals: 0,

    interviewed: 0,
    hired: 0,
    rejected: 0,
    pending: 0,
    placementRate: 0,

    status: [],
    topPositions: [],
    topEmployers: [],
    monthlyData: [],

    applicantData: [],
    employerData: [],
    vacancyData: [],
    referralData: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD REPORTS
  // ======================================================

  async function loadReports() {
    try {
      setLoading(true);
      setError("");

      const res = await getReports();

      const responseData = res?.data || {};
      const data = responseData.data || responseData;

      setReportData({
        applicants: Number(data.applicants) || 0,
        employers: Number(data.employers) || 0,
        vacancies: Number(data.vacancies) || 0,
        activeVacancies: Number(data.activeVacancies) || 0,
        referrals: Number(data.referrals) || 0,

        interviewed: Number(data.interviewed) || 0,
        hired: Number(data.hired) || 0,
        rejected: Number(data.rejected) || 0,
        pending: Number(data.pending) || 0,
        placementRate: Number(data.placementRate) || 0,

        status: Array.isArray(data.status)
          ? data.status
          : [],

        topPositions: Array.isArray(data.topPositions)
          ? data.topPositions
          : [],

        topEmployers: Array.isArray(data.topEmployers)
          ? data.topEmployers
          : [],

        monthlyData: Array.isArray(data.monthlyData)
          ? data.monthlyData
          : [],

        applicantData: Array.isArray(data.applicantData)
          ? data.applicantData
          : [],

        employerData: Array.isArray(data.employerData)
          ? data.employerData
          : [],

        vacancyData: Array.isArray(data.vacancyData)
          ? data.vacancyData
          : [],

        referralData: Array.isArray(data.referralData)
          ? data.referralData
          : [],
      });
    } catch (err) {
      console.error("LOAD REPORTS ERROR:", err);
      console.error(
        "REPORT ERROR RESPONSE:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load reports."
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // LOAD REPORTS ON PAGE LOAD
  // ======================================================

  useEffect(() => {
    loadReports();
  }, []);

  // ======================================================
  // LOADING STATE
  // ======================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-sm border-4 border-slate-200 border-t-blue-600" />

          <p className="text-base font-semibold text-slate-700">
            Loading reports...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Please wait while we load the latest report data.
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR STATE
  // ======================================================

  if (error) {
    return (
      <div className="space-y-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">


            <div>
              <h1>
                Reports & Analytics
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Recruitment analytics, employment outcomes,
                and downloadable reports.
              </p>
            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

          <p className="font-semibold text-red-700">
            Unable to load reports
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={loadReports}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // MAIN REPORTS PAGE
  // ======================================================

  return (
    <div className="space-y-8">

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3">


          <div>

            <h1>
              Reports & Analytics
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Recruitment analytics, employment outcomes,
              and downloadable reports.
            </p>

          </div>

        </div>

        <div className="w-full sm:w-auto">
          <ExportButtons
            reportData={reportData}
          />
        </div>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <ReportCards
        data={reportData}
      />

      {/* =====================================================
          CHARTS
      ====================================================== */}

      <ReportCharts
        status={reportData.status}
        monthlyData={reportData.monthlyData}
        topPositions={reportData.topPositions}
        topEmployers={reportData.topEmployers}
        interviewed={reportData.interviewed}
        hired={reportData.hired}
        rejected={reportData.rejected}
        pending={reportData.pending}
        placementRate={reportData.placementRate}
      />

    </div>
  );
}