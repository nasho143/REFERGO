import Modal from "../common/Modal";
import Button from "../common/Button";
import EmployerForm from "./EmployerForm";

export default function EmployerModal({
  isOpen,
  onClose,
  editing = false,
  form,
  handleChange,
  handleSubmit,
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editing ? "Edit Employer" : "Add Employer"}
      subtitle={
        editing
          ? "Update employer information and reapplication policy."
          : "Enter employer information and reapplication policy."
      }
      size="lg"
    >
      <div className="space-y-8">
        {/* =====================================================
            EMPLOYER INFORMATION
        ====================================================== */}
        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              Employer Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Enter the employer's company and contact information.
            </p>
          </div>

          <EmployerForm
            form={form}
            handleChange={handleChange}
          />
        </section>
      </div>

      {/* =====================================================
          ACTION BUTTONS
      ====================================================== */}
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
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
          {editing ? "Update Employer" : "Save Employer"}
        </Button>
      </div>
    </Modal>
  );
}