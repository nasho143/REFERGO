import { useCallback, useEffect, useMemo, useState } from "react";

import { getReports } from "../services/reportApi";
import { ReportsSkeleton } from "../components/common/Skeleton";
import Button from "../components/common/Button";
import PeriodFilter from "../components/common/PeriodFilter";
import KeyRates from "../components/common/KeyRates";

import ReportCards from "../components/reports/ReportCards";
import ReportCharts from "../components/reports/ReportCharts";
import ExportButtons from "../components/reports/ExportButtons";

import { DEFAULT_PERIOD, describePeriod } from "../utils/period";
import { buildReport } from "../utils/reportMetrics";

const list = (value) => (Array.isArray(value) ? value : []);

export default function Reports() {
  const [raw, setRaw] = useState(null);
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setError("");
      const res = await getReports();
      const body = res?.data || {};
      const data = body.data || body;

      setRaw({
        applicantData: list(data.applicantData),
        employerData: list(data.employerData),
        vacancyData: list(data.vacancyData),
        referralData: list(data.referralData),
      });
    } catch (err) {
      console.error("LOAD REPORTS ERROR:", err);
      setError(err?.response?.data?.message || "Failed to load reports.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReports();
  }, [loadReports]);

  // Everything on this page, in the graphs, and in the exports comes from
  // the same filtered records.
  const report = useMemo(() => (raw ? buildReport(raw, period) : null), [raw, period]);

  if (error) {
    return (
      <div role="alert" className="mx-auto mt-6 max-w-lg border border-red-600 bg-white">
        <h2 className="border-b border-red-600 bg-red-50 px-5 py-2.5 !text-base !text-red-700">
          Unable to load reports
        </h2>
        <div className="px-5 py-4">
          <p className="text-slate-800">{error}</p>
          <Button className="mt-4" onClick={loadReports}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!report) {
    return <ReportsSkeleton />;
  }

  const periodLabel = describePeriod(period);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-300 bg-white px-3 py-3">
        <PeriodFilter value={period} onChange={setPeriod} />
        <ExportButtons report={report} periodLabel={periodLabel} />
      </div>

      <ReportCards data={report} />

      <KeyRates
        items={[
          {
            label: "Placement rate",
            part: report.hired,
            whole: report.referrals,
            unit: "referrals hired",
            color: "#1e6b3c",
          },
          {
            label: "Interview rate",
            part: report.interviewed,
            whole: report.referrals,
            unit: "referrals interviewed",
          },
          {
            label: "Rejection rate",
            part: report.rejected,
            whole: report.referrals,
            unit: "referrals rejected",
            color: "#c8142f",
          },
          {
            label: "Active vacancies",
            part: report.activeVacancies,
            whole: report.vacancies,
            unit: "vacancies active",
            color: "#c9a800",
          },
        ]}
      />

      <ReportCharts report={report} />
    </div>
  );
}
