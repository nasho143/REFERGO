import {
  FaBuilding,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

export default function EmployerForm({
  form,
  handleChange,
}) {
  return (
    <div className="space-y-5">

      {/* =====================================================
          EMPLOYER INFORMATION FIELDS
      ====================================================== */}

      <div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* COMPANY NAME */}
          <div className="md:col-span-2">
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FaBuilding className="text-[#202860]" />
              Company Name
            </label>

            <input
              type="text"
              name="company_name"
              value={form.company_name || ""}
              onChange={handleChange}
              placeholder="Enter company name"
              required
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[#202860]
                focus:ring-2
                focus:ring-[#eef0f8]"
            />
          </div>

          {/* CONTACT PERSON */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FaUser className="text-[#202860]" />
              Contact Person
            </label>

            <input
              type="text"
              name="contact_person"
              value={form.contact_person || ""}
              onChange={handleChange}
              placeholder="Enter contact person"
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[#202860]
                focus:ring-2
                focus:ring-[#eef0f8]"
            />
          </div>

          {/* CONTACT NUMBER */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FaPhone className="text-green-600" />
              Contact Number
            </label>

            <input
              type="text"
              name="contact_number"
              value={form.contact_number || ""}
              onChange={handleChange}
              placeholder="09XXXXXXXXX"
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[#202860]
                focus:ring-2
                focus:ring-[#eef0f8]"
            />
          </div>

          {/* EMAIL */}
          <div className="md:col-span-2">
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FaEnvelope className="text-red-500" />
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              placeholder="company@email.com"
              className="
                w-full
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[#202860]
                focus:ring-2
                focus:ring-[#eef0f8]"
            />
          </div>

          {/* ADDRESS */}
          <div className="md:col-span-2">
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <FaMapMarkerAlt className="text-amber-600" />
              Company Address
            </label>

            <textarea
              name="address"
              value={form.address || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Enter complete company address"
              className="
                w-full
                resize-none
                rounded-lg
                border
                border-slate-300
                bg-white
                px-3
                py-2.5
                text-sm
                text-slate-800
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[#202860]
                focus:ring-2
                focus:ring-[#eef0f8]"
            />
          </div>

        </div>
      </div>


      {/* =====================================================
          REAPPLICATION POLICY
      ====================================================== */}

      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-500">
          Reapplication Policy
        </h3>

        <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">

            <div className="w-full sm:w-40">

              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FaClock className="text-purple-600" />
                Cooldown Days
              </label>

              <input
                type="number"
                name="reapply_cooldown_days"
                value={form.reapply_cooldown_days ?? 90}
                onChange={handleChange}
                min="0"
                max="3650"
                placeholder="90"
                className="
                  w-full
                  rounded-lg
                  border
                  border-slate-300
                  bg-white
                  px-3
                  py-2.5
                  text-sm
                  text-slate-800
                  outline-none
                  transition
                  focus:border-purple-600
                  focus:ring-2
                  focus:ring-purple-100"
              />

            </div>

            <div className="pb-2 text-sm font-medium text-slate-600">
              days
            </div>

          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Number of days an applicant must wait before
            reapplying to this employer after a rejection.
          </p>

        </div>
      </div>

    </div>
  );
}