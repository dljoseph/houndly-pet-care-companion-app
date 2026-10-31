import { supabase } from '@/lib/supabase';

const BUCKET = 'dog-photos';
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const SIGNED_URL_SECONDS = 60 * 60;

const EXTENSION_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export function validateDogPhoto(file: File): string | null {
  if (!EXTENSION_BY_TYPE[file.type]) return 'Photos must be a JPEG, PNG or WebP image.';
  if (file.size > MAX_PHOTO_BYTES) return 'Photos must be 5 MB or smaller.';
  return null;
}

export async function uploadDogPhoto(ownerId: string, dogId: string, file: File): Promise<string> {
  const extension = EXTENSION_BY_TYPE[file.type];
  const path = `${ownerId}/${dogId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function getDogPhotoUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error) throw error;
  return data.signedUrl;
}

export async function removeDogPhoto(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
