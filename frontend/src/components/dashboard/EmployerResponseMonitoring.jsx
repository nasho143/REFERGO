import RegisterTable from "../common/RegisterTable";

export default function EmployerResponseMonitoring({
  data = {},
}) {
  const totalReferrals =
    Number(data.totalReferrals) || 0;

  const interviewed =
    Number(data.interviewed) || 0;

  const hired =
    Number(data.hired) || 0;

  const rejected =
    Number(data.rejected) || 0;

  const pending =
    Number(data.pending) || 0;

  const awaitingEmployerResponse =
    Number(
      data.awaitingEmployerResponse
    ) || 0;

  const rows = [
    {
      title: "Total Referrals",
      count: totalReferrals,
      description:
        totalReferrals === 0
          ? "No referrals have been recorded yet."
          : "Total employment referrals recorded in the system.",
    },
    {
      title: "Interviewed",
      count: interviewed,
      description:
        interviewed === 0
          ? "No completed interviews have been recorded."
          : "Applicants with a recorded interview date.",
    },
    {
      title: "Hired",
      count: hired,
      description:
        hired === 0
          ? "No successful employment outcomes recorded."
          : "Applicants who were successfully hired.",
    },
    {
      title: "Rejected",
      count: rejected,
      description:
        rejected === 0
          ? "No rejected referrals recorded."
          : "Referrals that resulted in rejection.",
    },
    {
      title: "Pending",
      count: pending,
      description:
        pending === 0
          ? "No referrals are currently pending."
          : "Referrals still awaiting further action.",
    },
    {
      title: "Awaiting Employer Response",
      count: awaitingEmployerResponse,
      description:
        awaitingEmployerResponse === 0
          ? "No referrals are currently awaiting employer response."
          : "Referrals where employer feedback or response is still pending.",
    },
  ];

  return (
    <RegisterTable
      title="Employer response monitoring"
      note="Monitor referral progress and employer responses."
      rows={rows}
    />
  );
}
