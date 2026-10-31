import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import DogProfileForm from '@/components/DogProfileForm';
import { dogToFormValues, deleteDog, saveDog, validateDogForm } from '@/lib/dogs';
import type { Dog, DogFormValues } from '@/types/dog';

type DogProfileScreenProps = {
  userId: string;
  dog: Dog | null;
  isFirstDog: boolean;
  onSaved: (dog: Dog) => void;
  onDeleted: (dog: Dog) => void;
};

function describeError(error: unknown): string {
  if (error instanceof TypeError) return "We couldn't reach Houndly. Check your connection and try again.";
  return 'Something went wrong while saving. Please try again.';
}

export default function DogProfileScreen({ userId, dog, isFirstDog, onSaved, onDeleted }: DogProfileScreenProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isNewDog = dog === null;

  const heading = isFirstDog ? 'Add your first dog' : isNewDog ? 'Add a dog' : 'Dog profile';
  const subheading = isFirstDog
    ? 'Tell us about your dog to start building their daily checklist.'
    : isNewDog
      ? 'Add another dog to your household.'
      : `Keep ${dog.name}'s details up to date.`;

  const handleSubmit = async (values: DogFormValues, photoFile: File | null) => {
    const problem = validateDogForm(values);
    if (problem) {
      setErrorMessage(problem);
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const saved = await saveDog({ userId, existing: dog, values, photoFile });
      onSaved(saved);
    } catch (error) {
      setErrorMessage(describeError(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!dog) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await deleteDog(dog);
      setIsConfirmingDelete(false);
      onDeleted(dog);
    } catch (error) {
      setErrorMessage(describeError(error));
      setIsConfirmingDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-3xl font-bold text-brand-800">{heading}</h1>
        <p className="mt-1 text-base text-ink-muted">{subheading}</p>
      </section>

      <DogProfileForm
        key={dog?.id ?? 'new'}
        initialValues={dogToFormValues(dog)}
        currentPhotoPath={dog?.photo_path ?? null}
        isSaving={isSaving}
        errorMessage={errorMessage}
        submitLabel={isNewDog ? 'Add dog' : 'Save profile'}
        footer={
          dog && (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="tap-target flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-700"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete {dog.name}
            </button>
          )
        }
        onSubmit={handleSubmit}
      />

      {isConfirmingDelete && dog && (
        <ConfirmDialog
          title={`Delete ${dog.name}?`}
          message="This permanently removes their profile, photo, checklist, vaccinations and appointments."
          confirmLabel="Delete dog"
          isWorking={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmingDelete(false)}
        />
      )}
    </div>
  );
}
