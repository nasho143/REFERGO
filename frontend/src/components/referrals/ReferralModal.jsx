import Modal from "../common/Modal";
import Button from "../common/Button";
import ReferralForm from "./ReferralForm";

export default function ReferralModal({
  isOpen,
  onClose,
  editing = false,
  form,
  applicants = [],
  vacancies = [],
  handleChange,
  handleSubmit,
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Edit Referral" : "Add Referral"}
      subtitle={
        editing
          ? "Update referral information."
          : "Fill in the referral information."
      }
      size="lg"
    >
      <div className="space-y-10">

        {/* =====================================================
            REFERRAL INFORMATION
        ====================================================== */}
        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              Referral Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Enter the applicant, vacancy, and referral details.
            </p>
          </div>

          <ReferralForm
            form={form}
            applicants={applicants}
            vacancies={vacancies}
            handleChange={handleChange}
          />
        </section>

      </div>

      {/* =====================================================
          ACTION BUTTONS
      ====================================================== */}
      <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">

        <Button
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          {editing ? "Update Referral" : "Save Referral"}
        </Button>

      </div>
    </Modal>
  );
}