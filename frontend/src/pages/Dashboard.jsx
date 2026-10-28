import { useCallback, useEffect, useState } from "react";

import { DashboardSkeleton } from "../components/common/Skeleton";
import Button from "../components/common/Button";
import MiniCharts from "../components/common/MiniCharts";

import { getDashboard } from "../services/dashboardApi";
import { DEFAULT_PERIOD, AGE_GROUPS } from "../utils/period";
import { labelForKey } from "../utils/chartData";
import { linkTo } from "../utils/quickFilter";

import DashboardHero from "../components/dashboard/DashboardHero";
import DashboardCards from "../components/dashboard/DashboardCards";
import KeyRates from "../components/common/KeyRates";
import EmployerResponse from "../components/dashboard/EmployerResponse";
import ReferralStatusPanel from "../components/dashboard/ReferralStatusPanel";
import DashboardAlerts from "../components/dashboard/DashboardAlerts";
import DashboardApprovals from "../components/dashboard/DashboardApprovals";
import RecentReferrals from "../components/dashboard/RecentReferrals";
import RecentActivity from "../components/dashboard/RecentActivity";

const num = (value) => Number(value) || 0;

const list = (value) => (Array.isArray(value) ? value : []);

const breakdown = (value) =>
  list(value).map((row) => ({
    label: row?.label || "Not specified",
    total: num(row?.total),
  }));

const EMPTY = {
  role: "peso_staff",
  applicants: 0,
  employers: 0,
  vacancies: 0,
  referrals: 0,
  activeVacancies: 0,
  pendingApprovals: { applicants: 0, employers: 0, vacancies: 0, referrals: 0, total: 0 },
  approvalSummary: { pending: 0, approved: 0, rejected: 0 },
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
  gender: [],
  ageGroups: [],
  readiness: { ready: 0, notReady: 0 },
  vacancyStatus: [],
  employerStatus: [],
  referralTrend: [],
  alerts: {
    followUps: 0,
    expiringVacancies: 0,
    incompleteApplicants: 0,
    interviewsThisWeek: 0,
    hiredThisMonth: 0,
  },
};

export default function Dashboard() {
  const [data, setData] = useState(EMPTY);
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params =
        period.mode !== "all" && period.value
          ? { mode: period.mode, date: period.value }
          : {};

      const response = await getDashboard(params);
      const body = response?.data || {};
      const d = body.data || body;

      setData({
        role: String(d.role || "peso_staff").trim().toLowerCase(),
        applicants: num(d.applicants),
        employers: num(d.employers),
        vacancies: num(d.vacancies),
        referrals: num(d.referrals),
        activeVacancies: num(d.activeVacancies),

        pendingApprovals: {
          applicants: num(d.pendingApprovals?.applicants),
          employers: num(d.pendingApprovals?.employers),
          vacancies: num(d.pendingApprovals?.vacancies),
          referrals: num(d.pendingApprovals?.referrals),
          total: num(d.pendingApprovals?.total),
        },
        approvalSummary: {
          pending: num(d.approvalSummary?.pending),
          approved: num(d.approvalSummary?.approved),
          rejected: num(d.approvalSummary?.rejected),
        },
        pendingApprovalRecords: list(d.pendingApprovalRecords),

        status: list(d.status).map((s) => ({
          status: s?.status || "Unknown",
          total: num(s?.total),
        })),
        recentReferrals: list(d.recentReferrals).length
          ? list(d.recentReferrals)
          : list(d.recent_referrals),
        employerResponse: {
          totalReferrals: num(d.employerResponse?.totalReferrals),
          interviewed: num(d.employerResponse?.interviewed),
          hired: num(d.employerResponse?.hired),
          rejected: num(d.employerResponse?.rejected),
          pending: num(d.employerResponse?.pending),
          awaitingEmployerResponse: num(
            d.employerResponse?.awaitingEmployerResponse
          ),
        },

        gender: breakdown(d.gender),
        ageGroups: breakdown(d.ageGroups),
        readiness: {
          ready: num(d.readiness?.ready),
          notReady: num(d.readiness?.notReady),
        },
        vacancyStatus: breakdown(d.vacancyStatus),
        employerStatus: breakdown(d.employerStatus),
        referralTrend: list(d.referralTrend).map((row) => ({
          label: row?.label,
          total: num(row?.total),
          hired: num(row?.hired),
        })),

        alerts: {
          followUps: num(d.alerts?.followUps),
          expiringVacancies: num(d.alerts?.expiringVacancies),
          incompleteApplicants: num(d.alerts?.incompleteApplicants),
          interviewsThisWeek: num(d.alerts?.interviewsThisWeek),
          hiredThisMonth: num(d.alerts?.hiredThisMonth),
        },
      });
    } catch (err) {
      console.error("DASHBOARD LOADING ERROR:", err);
      setError(
        err?.response?.data?.message || "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // The first load shows a spinner; later period changes keep the page in place.
  if (loading && data === EMPTY) {
    return <DashboardSkeleton />;
  }

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

  const isHead = data.role === "department_head";

  const ageData = [
    ...AGE_GROUPS.map((group) => ({
      name: group.label,
      value:
        data.ageGroups.find((a) => a.label === group.label)?.total || 0,
    })),
    {
      name: "Not specified",
      value:
        data.ageGroups.find((a) => a.label === "Not specified")?.total || 0,
    },
  ];

  const approvedEmployers = data.employerStatus
    .filter((e) => e.label.toLowerCase() === "approved")
    .reduce((sum, e) => sum + e.total, 0);

  const charts = [
    {
      title: "Referrals over time",
      type: "line",
      to: linkTo("/referrals", {}, period),
      data: data.referralTrend.map((row) => ({
        name: labelForKey(row.label),
        total: row.total,
        hired: row.hired,
      })),
      series: [
        { key: "total", name: "Referred", color: "#202860" },
        { key: "hired", name: "Hired", color: "#1e6b3c" },
      ],
    },
    {
      title: "Applicants by gender",
      type: "donut",
      to: linkTo("/applicants", {}, period),
      data: data.gender.map((g) => ({ name: g.label, value: g.total })),
    },
    {
      title: "Applicants by age group",
      type: "bar",
      to: linkTo("/applicants", {}, period),
      data: ageData,
    },
    {
      title: "Applicant readiness",
      type: "donut",
      to: linkTo("/applicants", {}, period),
      data: [
        { name: "Ready for Referral", value: data.readiness.ready },
        { name: "Not yet ready", value: data.readiness.notReady },
      ],
    },
    {
      title: "Job vacancies by status",
      type: "donut",
      to: linkTo("/vacancies", {}, period),
      data: data.vacancyStatus.map((v) => ({ name: v.label, value: v.total })),
    },
    {
      title: "Employers by approval status",
      type: "donut",
      to: linkTo("/employers", {}, period),
      data: data.employerStatus.map((e) => ({ name: e.label, value: e.total })),
    },
  ];

  return (
    <div className="space-y-4">
      <DashboardHero period={period} setPeriod={setPeriod} />

      <DashboardCards
        period={period}
        applicants={data.applicants}
        employers={data.employers}
        vacancies={data.vacancies}
        referrals={data.referrals}
        readyApplicants={data.readiness.ready}
        approvedEmployers={approvedEmployers}
        activeVacancies={data.activeVacancies}
        hiredReferrals={data.employerResponse.hired}
      />

      <KeyRates
        items={[
          {
            label: "Placement rate",
            part: data.employerResponse.hired,
            whole: data.referrals,
            unit: "referrals hired",
            to: linkTo("/referrals", { status: "Hired" }, period),
            color: "#1e6b3c",
          },
          {
            label: "Interview rate",
            part: data.employerResponse.interviewed,
            whole: data.referrals,
            unit: "referrals interviewed",
            to: linkTo("/referrals", { interviewed: 1 }, period),
          },
          {
            label: "Applicants ready",
            part: data.readiness.ready,
            whole: data.applicants,
            unit: "applicants ready",
            to: linkTo("/applicants", { ready: 1 }, period),
            color: "#3a4789",
          },
          {
            label: "Active vacancies",
            part: data.activeVacancies,
            whole: data.vacancies,
            unit: "vacancies active",
            to: linkTo("/vacancies", { vstatus: "open" }, period),
            color: "#c9a800",
          },
        ]}
      />

      {isHead && (
        <DashboardApprovals
          pending={data.pendingApprovals}
          summary={data.approvalSummary}
        />
      )}

      <DashboardAlerts alerts={data.alerts} />

      <ReferralStatusPanel
        status={data.status}
        total={data.referrals}
        period={period}
      />

      <EmployerResponse data={data.employerResponse} period={period} />

      <MiniCharts charts={charts} />

      {isHead ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <RecentReferrals referrals={data.recentReferrals} />
          <RecentActivity />
        </div>
      ) : (
        <RecentReferrals referrals={data.recentReferrals} />
      )}
    </div>
  );
}
