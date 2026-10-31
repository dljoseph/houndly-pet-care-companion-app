/*
# Create profiles and dogs with owner-only access

1. New Tables
- profiles: one row per account, holding the owner's display name and when the account was created.
- dogs: each dog belonging to an owner. Fields: name (required), breed, date of birth, weight in kg, photo location, vet practice name, vet phone, notes, created at.

2. Storage
- Creates the private dog-photos bucket. Files are stored under {owner_id}/{dog_id}/ so each owner's photos sit in their own folder.
- Storage rules let only the owner view, upload, replace and delete files in their own folder.

3. Security
- Row level security is enabled on profiles and dogs.
- Each row is tied to its owner (owner_id = the signed-in user). Signed-in users can only read, create, change and delete their own rows.
- Anonymous visitors have no access to either table or to the photo bucket.

4. Notes
- owner_id defaults to the signed-in user, so the app does not need to send it when creating a dog.
- Deleting an owner's account removes their profile and dogs.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text CHECK (display_name IS NULL OR char_length(display_name) <= 80),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
TO authenticated USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS dogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 60),
  breed text CHECK (breed IS NULL OR char_length(breed) <= 80),
  date_of_birth date,
  weight_kg numeric(5,2) CHECK (weight_kg IS NULL OR (weight_kg > 0 AND weight_kg < 200)),
  photo_path text,
  vet_practice_name text CHECK (vet_practice_name IS NULL OR char_length(vet_practice_name) <= 120),
  vet_phone text CHECK (vet_phone IS NULL OR char_length(vet_phone) <= 30),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dogs_owner_id_idx ON dogs (owner_id);

ALTER TABLE dogs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON dogs TO authenticated;

DROP POLICY IF EXISTS "select_own_dogs" ON dogs;
CREATE POLICY "select_own_dogs" ON dogs FOR SELECT
TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_dogs" ON dogs;
CREATE POLICY "insert_own_dogs" ON dogs FOR INSERT
TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "update_own_dogs" ON dogs;
CREATE POLICY "update_own_dogs" ON dogs FOR UPDATE
TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "delete_own_dogs" ON dogs;
CREATE POLICY "delete_own_dogs" ON dogs FOR DELETE
TO authenticated USING (auth.uid() = owner_id);

INSERT INTO storage.buckets (id, name, public)
VALUES ('dog-photos', 'dog-photos', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "select_own_dog_photos" ON storage.objects;
CREATE POLICY "select_own_dog_photos" ON storage.objects FOR SELECT
TO authenticated USING (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "insert_own_dog_photos" ON storage.objects;
CREATE POLICY "insert_own_dog_photos" ON storage.objects FOR INSERT
TO authenticated WITH CHECK (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "update_own_dog_photos" ON storage.objects;
CREATE POLICY "update_own_dog_photos" ON storage.objects FOR UPDATE
TO authenticated USING (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "delete_own_dog_photos" ON storage.objects;
CREATE POLICY "delete_own_dog_photos" ON storage.objects FOR DELETE
TO authenticated USING (bucket_id = 'dog-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
