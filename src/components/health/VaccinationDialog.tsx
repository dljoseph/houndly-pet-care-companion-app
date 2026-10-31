import { useState, type FormEvent } from 'react';
import FormDialog from '@/components/FormDialog';
import { saveVaccination, validateVaccinationForm } from '@/lib/health';
import type { Vaccination, VaccinationFormValues } from '@/types/health';

type VaccinationDialogProps = {
  dogId: string;
  existing: Vaccination | null;
  onSaved: () => void;
  onClose: () => void;
};

const FIELD_CLASS =
  'tap-target w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-60';
const LABEL_CLASS = 'text-sm font-semibold text-ink';

function toFormValues(existing: Vaccination | null): VaccinationFormValues {
  return {
    name: existing?.name ?? '',
    dateGiven: existing?.date_given ?? '',
    dueDate: existing?.due_date ?? '',
    clinic: existing?.clinic ?? '',
    notes: existing?.notes ?? '',
  };
}

export default function VaccinationDialog({ dogId, existing, onSaved, onClose }: VaccinationDialogProps) {
  const [values, setValues] = useState<VaccinationFormValues>(() => toFormValues(existing));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = (field: keyof VaccinationFormValues) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateVaccinationForm(values);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await saveVaccination(dogId, existing?.id ?? null, values);
      onSaved();
    } catch {
      setErrorMessage("We couldn't save this vaccination. Check your connection and try again.");
      setIsSaving(false);
    }
  };

  return (
    <FormDialog title={existing ? 'Edit vaccination' : 'Add vaccination'} onClose={onClose}>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="vaccination-name" className={LABEL_CLASS}>
            Vaccination <span className="text-rose-700">(required)</span>
          </label>
          <input
            id="vaccination-name"
            type="text"
            maxLength={120}
            value={values.name}
            onChange={(event) => updateField('name')(event.target.value)}
            disabled={isSaving}
            placeholder="e.g. Rabies"
            className={FIELD_CLASS}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vaccination-given" className={LABEL_CLASS}>
              Date given <span className="text-rose-700">(required)</span>
            </label>
            <input
              id="vaccination-given"
              type="date"
              value={values.dateGiven}
              onChange={(event) => updateField('dateGiven')(event.target.value)}
              disabled={isSaving}
              className={FIELD_CLASS}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vaccination-due" className={LABEL_CLASS}>
              Next due <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <input
              id="vaccination-due"
              type="date"
              value={values.dueDate}
              onChange={(event) => updateField('dueDate')(event.target.value)}
              disabled={isSaving}
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="vaccination-clinic" className={LABEL_CLASS}>
            Clinic <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            id="vaccination-clinic"
            type="text"
            maxLength={120}
            value={values.clinic}
            onChange={(event) => updateField('clinic')(event.target.value)}
            disabled={isSaving}
            className={FIELD_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="vaccination-notes" className={LABEL_CLASS}>
            Notes <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <textarea
            id="vaccination-notes"
            rows={3}
            maxLength={1000}
            value={values.notes}
            onChange={(event) => updateField('notes')(event.target.value)}
            disabled={isSaving}
            className={FIELD_CLASS}
          />
        </div>

        {errorMessage && (
          <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="tap-target rounded-full border border-cream-300 bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-cream-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="tap-target rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-cream-50 shadow-soft transition hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:bg-cream-300 disabled:text-ink-muted disabled:shadow-none"
          >
            {isSaving ? 'Saving...' : 'Save vaccination'}
          </button>
        </div>
      </form>
    </FormDialog>
  );
}
