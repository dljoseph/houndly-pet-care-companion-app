import { useEffect, useState, type ChangeEvent } from 'react';
import { Camera, PawPrint } from 'lucide-react';
import { getDogPhotoUrl, validateDogPhoto } from '@/lib/dogPhotos';

type DogPhotoFieldProps = {
  currentPhotoPath: string | null;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onError: (message: string | null) => void;
};

export default function DogPhotoField({
  currentPhotoPath,
  selectedFile,
  onFileChange,
  onError,
}: DogPhotoFieldProps) {
  const [savedPhotoUrl, setSavedPhotoUrl] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!currentPhotoPath) return;
    let isActive = true;
    getDogPhotoUrl(currentPhotoPath)
      .then((url) => {
        if (isActive) setSavedPhotoUrl(url);
      })
      .catch(() => {
        if (isActive) setSavedPhotoUrl(null);
      });
    return () => {
      isActive = false;
    };
  }, [currentPhotoPath]);

  useEffect(() => {
    if (!selectedFile) {
      setLocalPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setLocalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;
    const problem = validateDogPhoto(file);
    if (problem) {
      onError(problem);
      onFileChange(null);
      return;
    }
    onError(null);
    onFileChange(file);
  };

  const imageUrl = localPreviewUrl ?? savedPhotoUrl;

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-brand-600">
        {imageUrl ? (
          <img src={imageUrl} alt="Your dog's photo" className="h-full w-full object-cover" />
        ) : (
          <PawPrint className="h-14 w-14" aria-hidden="true" />
        )}
      </span>
      <label className="tap-target flex cursor-pointer items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-cream-200 focus-within:ring-2 focus-within:ring-brand-500">
        <Camera className="h-4 w-4" aria-hidden="true" />
        {selectedFile || currentPhotoPath ? 'Change photo' : 'Add photo'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="sr-only"
        />
      </label>
      <p className="text-xs text-ink-muted">JPEG, PNG or WebP, up to 5 MB.</p>
    </div>
  );
}
