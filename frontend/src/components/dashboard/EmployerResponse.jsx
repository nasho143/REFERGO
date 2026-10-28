import { Link } from "react-router-dom";
import { linkTo } from "../../utils/quickFilter";

// How employers are responding to referrals. Each tile opens the matching
// referrals.
export default function EmployerResponse({ data = {}, period = null }) {
  const go = (params) => linkTo("/referrals", params, period);

  const items = [
    { title: "Total referrals", count: data.totalReferrals, to: go({}) },
    { title: "Interviewed", count: data.interviewed, to: go({ interviewed: 1 }) },
    { title: "Hired", count: data.hired, to: go({ status: "Hired" }) },
    { title: "Rejected / Failed", count: data.rejected, to: go({ status: "Rejected,Failed" }) },
    { title: "Pending", count: data.pending, to: go({ status: "Pending" }) },
    {
      title: "Awaiting employer response",
      count: data.awaitingEmployerResponse,
      to: go({ status: "No Response" }),
    },
  ];

  return (
    <section
      aria-labelledby="response-title"
      className="border border-slate-300 bg-white"
    >
      <h2
        id="response-title"
        className="border-b border-slate-300 bg-slate-50 px-4 py-2 !text-[15px]"
      >
        Employer response
      </h2>

      <ul className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => {
          const count = Number(item.count) || 0;

          return (
            <li key={item.title} className="bg-white">
              <Link
                to={item.to}
                aria-label={`${item.title}: ${count}. Open referrals.`}
                className="flex h-full flex-col px-3 py-2.5 no-underline hover:bg-blue-50"
              >
                <span className="text-[12.5px] font-semibold text-slate-600">
                  {item.title}
                </span>
                <span className="mt-0.5 font-serif text-2xl font-bold text-blue-600">
                  {count}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
