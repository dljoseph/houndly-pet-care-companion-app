import { useState, type FormEvent, type ReactNode } from 'react';
import DogPhotoField from '@/components/DogPhotoField';
import type { DogFormValues } from '@/types/dog';

type DogProfileFormProps = {
  initialValues: DogFormValues;
  currentPhotoPath: string | null;
  isSaving: boolean;
  errorMessage: string | null;
  submitLabel: string;
  footer?: ReactNode;
  onSubmit: (values: DogFormValues, photoFile: File | null) => void;
};

const FIELD_CLASS =
  'tap-target w-full rounded-xl border border-cream-300 bg-cream-50 px-3 py-2.5 text-base text-ink placeholder:text-ink-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:opacity-60';

const LABEL_CLASS = 'text-sm font-semibold text-ink';

export default function DogProfileForm({
  initialValues,
  currentPhotoPath,
  isSaving,
  errorMessage,
  submitLabel,
  footer,
  onSubmit,
}: DogProfileFormProps) {
  const [values, setValues] = useState<DogFormValues>(initialValues);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const updateField = (field: keyof DogFormValues) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values, photoFile);
  };

  return (
    <form className="grid gap-6 lg:grid-cols-[280px_1fr]" onSubmit={handleSubmit} noValidate>
      <section
        aria-labelledby="photo-heading"
        className="flex flex-col items-center gap-4 rounded-3xl border border-cream-300 bg-white p-6 shadow-soft"
      >
        <h2 id="photo-heading" className="sr-only">
          Photo
        </h2>
        <DogPhotoField
          currentPhotoPath={currentPhotoPath}
          selectedFile={photoFile}
          onFileChange={setPhotoFile}
          onError={setPhotoError}
        />
        {photoError && (
          <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-center text-sm text-rose-700">
            {photoError}
          </p>
        )}
      </section>

      <section className="flex flex-col gap-5 rounded-3xl border border-cream-300 bg-white p-6 shadow-soft">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="dog-name" className={LABEL_CLASS}>
              Name <span className="text-rose-700">(required)</span>
            </label>
            <input
              id="dog-name"
              type="text"
              required
              maxLength={60}
              value={values.name}
              onChange={updateField('name')}
              disabled={isSaving}
              placeholder="e.g. Biscuit"
              className={FIELD_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="dog-breed" className={LABEL_CLASS}>
              Breed
            </label>
            <input
              id="dog-breed"
              type="text"
              maxLength={80}
              value={values.breed}
              onChange={updateField('breed')}
              disabled={isSaving}
              placeholder="e.g. Cocker spaniel"
              className={FIELD_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="dog-dob" className={LABEL_CLASS}>
              Date of birth
            </label>
            <input
              id="dog-dob"
              type="date"
              value={values.dateOfBirth}
              onChange={updateField('dateOfBirth')}
              disabled={isSaving}
              className={FIELD_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="dog-weight" className={LABEL_CLASS}>
              Weight (kg)
            </label>
            <input
              id="dog-weight"
              type="number"
              inputMode="decimal"
              min="0.1"
              max="199.99"
              step="0.01"
              value={values.weightKg}
              onChange={updateField('weightKg')}
              disabled={isSaving}
              placeholder="e.g. 12.5"
              className={FIELD_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="vet-practice" className={LABEL_CLASS}>
              Vet practice name
            </label>
            <input
              id="vet-practice"
              type="text"
              maxLength={120}
              value={values.vetPracticeName}
              onChange={updateField('vetPracticeName')}
              disabled={isSaving}
              placeholder="e.g. Riverside Veterinary Centre"
              className={FIELD_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="vet-phone" className={LABEL_CLASS}>
              Vet phone
            </label>
            <input
              id="vet-phone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
              value={values.vetPhone}
              onChange={updateField('vetPhone')}
              disabled={isSaving}
              placeholder="e.g. 01234 567890"
              className={FIELD_CLASS}
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="dog-notes" className={LABEL_CLASS}>
              Notes
            </label>
            <textarea
              id="dog-notes"
              rows={4}
              maxLength={2000}
              value={values.notes}
              onChange={updateField('notes')}
              disabled={isSaving}
              placeholder="Anything else worth knowing about your dog"
              className={`${FIELD_CLASS} min-h-28`}
            />
          </div>
        </div>

        {errorMessage && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>{footer}</div>
          <button
            type="submit"
            disabled={isSaving}
            className="tap-target rounded-full bg-brand-700 px-6 py-3 text-base font-semibold text-cream-50 shadow-soft transition hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : submitLabel}
          </button>
        </div>
      </section>
    </form>
  );
}
