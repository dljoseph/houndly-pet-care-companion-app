import { supabase } from '@/lib/supabase';
import { removeDogPhoto, uploadDogPhoto } from '@/lib/dogPhotos';
import type { Dog, DogFormValues } from '@/types/dog';

const DOG_COLUMNS =
  'id, owner_id, name, breed, date_of_birth, weight_kg, photo_path, vet_practice_name, vet_phone, notes, created_at';

type SaveDogInput = {
  userId: string;
  existing: Dog | null;
  values: DogFormValues;
  photoFile: File | null;
};

function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function validateDogForm(values: DogFormValues): string | null {
  const name = values.name.trim();
  if (!name) return 'Please give your dog a name.';
  if (name.length > 60) return 'Names can be up to 60 characters.';
  if (values.breed.trim().length > 80) return 'Breeds can be up to 80 characters.';
  if (values.dateOfBirth && new Date(values.dateOfBirth) > new Date()) {
    return 'Date of birth cannot be in the future.';
  }
  if (values.weightKg.trim()) {
    const weight = Number(values.weightKg);
    if (!Number.isFinite(weight) || weight <= 0 || weight >= 200) {
      return 'Weight should be more than 0 kg and less than 200 kg.';
    }
  }
  if (values.vetPhone.trim().length > 30) return 'Phone numbers can be up to 30 characters.';
  if (values.notes.trim().length > 2000) return 'Notes can be up to 2,000 characters.';
  return null;
}

function toDogRow(values: DogFormValues) {
  return {
    name: values.name.trim(),
    breed: blankToNull(values.breed),
    date_of_birth: values.dateOfBirth || null,
    weight_kg: values.weightKg.trim() ? Number(values.weightKg) : null,
    vet_practice_name: blankToNull(values.vetPracticeName),
    vet_phone: blankToNull(values.vetPhone),
    notes: blankToNull(values.notes),
  };
}

export function dogToFormValues(dog: Dog | null): DogFormValues {
  return {
    name: dog?.name ?? '',
    breed: dog?.breed ?? '',
    dateOfBirth: dog?.date_of_birth ?? '',
    weightKg: dog?.weight_kg != null ? String(dog.weight_kg) : '',
    vetPracticeName: dog?.vet_practice_name ?? '',
    vetPhone: dog?.vet_phone ?? '',
    notes: dog?.notes ?? '',
  };
}

export async function listDogs(): Promise<Dog[]> {
  const { data, error } = await supabase
    .from('dogs')
    .select(DOG_COLUMNS)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data as Dog[];
}

export async function saveDog({ userId, existing, values, photoFile }: SaveDogInput): Promise<Dog> {
  const dogId = existing?.id ?? crypto.randomUUID();
  const newPhotoPath = photoFile ? await uploadDogPhoto(userId, dogId, photoFile) : null;
  const row = { ...toDogRow(values), ...(newPhotoPath ? { photo_path: newPhotoPath } : {}) };

  const query = existing
    ? supabase.from('dogs').update(row).eq('id', dogId)
    : supabase.from('dogs').insert({ id: dogId, ...row });
  const { data, error } = await query.select(DOG_COLUMNS).single();

  if (error) {
    if (newPhotoPath) await removeDogPhoto(newPhotoPath).catch(() => undefined);
    throw error;
  }

  if (newPhotoPath && existing?.photo_path) {
    await removeDogPhoto(existing.photo_path).catch(() => undefined);
  }

  return data as Dog;
}

export async function deleteDog(dog: Dog): Promise<void> {
  const { error } = await supabase.from('dogs').delete().eq('id', dog.id);
  if (error) throw error;
  if (dog.photo_path) await removeDogPhoto(dog.photo_path).catch(() => undefined);
}
