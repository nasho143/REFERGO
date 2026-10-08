import Modal from "../common/Modal";
import Button from "../common/Button";
import VacancyForm from "./VacancyForm";

export default function VacancyModal({
  isOpen,
  onClose,
  editingVacancy,
  form,
  employers,
  onChange,
  onSubmit,
  submitting = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingVacancy ? "Edit Job Vacancy" : "Add Job Vacancy"}
      subtitle={
        editingVacancy
          ? "Update job vacancy information and requirements."
          : "Enter job vacancy information and requirements."
      }
      size="lg"
    >
      <div className="space-y-8">
        <section>
          <div className="mb-5 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-bold text-slate-800">
              Employer Information
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Select the employer and provide the basic vacancy information.
            </p>
          </div>

          <VacancyForm
            form={form}
            employers={employers}
            onChange={onChange}
            editingVacancy={editingVacancy}
          />
        </section>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>

        <Button
          variant="primary"
          loading={submitting}
          onClick={onSubmit}
        >
          {editingVacancy ? "Update Vacancy" : "Save Vacancy"}
        </Button>
      </div>
    </Modal>
  );
}