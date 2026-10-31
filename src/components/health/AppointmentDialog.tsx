import { useState, type FormEvent } from 'react';
import FormDialog from '@/components/FormDialog';
import { saveAppointment, toDateTimeLocal, validateAppointmentForm } from '@/lib/health';
import { APPOINTMENT_TYPES, type Appointment, type AppointmentFormValues } from '@/types/health';

type AppointmentDialogProps = {
  dogId: string;
  existing: Appointment | null;
  onSaved: () => void;
  onClose: () => void;
};

const FIELD_CLASS =
  'tap-target w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-60';
const LABEL_CLASS = 'text-sm font-semibold text-ink';

function toFormValues(existing: Appointment | null): AppointmentFormValues {
  return {
    type: existing?.type ?? 'Vet',
    scheduledAt: existing ? toDateTimeLocal(existing.scheduled_at) : '',
    location: existing?.location ?? '',
    notes: existing?.notes ?? '',
  };
}

export default function AppointmentDialog({ dogId, existing, onSaved, onClose }: AppointmentDialogProps) {
  const [values, setValues] = useState<AppointmentFormValues>(() => toFormValues(existing));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateField = (field: keyof AppointmentFormValues) => (value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateAppointmentForm(values);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await saveAppointment(dogId, existing?.id ?? null, values);
      onSaved();
    } catch {
      setErrorMessage("We couldn't save this appointment. Check your connection and try again.");
      setIsSaving(false);
    }
  };

  return (
    <FormDialog title={existing ? 'Edit appointment' : 'Add appointment'} onClose={onClose}>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="appointment-type" className={LABEL_CLASS}>
              Type
            </label>
            <select
              id="appointment-type"
              value={values.type}
              onChange={(event) =>
                setValues((current) => ({ ...current, type: event.target.value === 'Grooming' ? 'Grooming' : 'Vet' }))
              }
              disabled={isSaving}
              className={FIELD_CLASS}
            >
              {APPOINTMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type === 'Vet' ? 'Vet check-up' : 'Grooming'}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="appointment-when" className={LABEL_CLASS}>
              Date and time <span className="text-rose-700">(required)</span>
            </label>
            <input
              id="appointment-when"
              type="datetime-local"
              value={values.scheduledAt}
              onChange={(event) => updateField('scheduledAt')(event.target.value)}
              disabled={isSaving}
              className={FIELD_CLASS}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="appointment-location" className={LABEL_CLASS}>
            Location <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <input
            id="appointment-location"
            type="text"
            maxLength={160}
            value={values.location}
            onChange={(event) => updateField('location')(event.target.value)}
            disabled={isSaving}
            className={FIELD_CLASS}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="appointment-notes" className={LABEL_CLASS}>
            Notes <span className="font-normal text-ink-muted">(optional)</span>
          </label>
          <textarea
            id="appointment-notes"
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
            {isSaving ? 'Saving...' : 'Save appointment'}
          </button>
        </div>
      </form>
    </FormDialog>
  );
}
