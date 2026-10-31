/*
# Create vaccinations and appointments with owner-only access

1. New Tables
- vaccinations: name, date given, due date, clinic, notes. Used for the Overdue, Due within 30 days and Up to date badges.
- appointments: type (Vet or Grooming), date and time, location, notes.

2. Security
- Row level security is enabled on both tables.
- Every row has owner_id set to the signed-in user. Users can only read and change their own rows.
- Each row must link to a dog the user owns.
- Anonymous visitors have no access.

3. Notes
- Deleting a dog removes its vaccinations and appointments.
*/

CREATE TABLE IF NOT EXISTS vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
  date_given date NOT NULL,
  due_date date,
  clinic text CHECK (clinic IS NULL OR char_length(clinic) <= 120),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (due_date IS NULL OR due_date >= date_given)
);

CREATE INDEX IF NOT EXISTS vaccinations_dog_id_idx ON vaccinations (dog_id);

ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON vaccinations TO authenticated;

DROP POLICY IF EXISTS "select_own_vaccinations" ON vaccinations;
CREATE POLICY "select_own_vaccinations" ON vaccinations FOR SELECT
TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_vaccinations" ON vaccinations;
CREATE POLICY "insert_own_vaccinations" ON vaccinations FOR INSERT
TO authenticated WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_id AND d.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "update_own_vaccinations" ON vaccinations;
CREATE POLICY "update_own_vaccinations" ON vaccinations FOR UPDATE
TO authenticated USING (auth.uid() = owner_id)
WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_id AND d.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "delete_own_vaccinations" ON vaccinations;
CREATE POLICY "delete_own_vaccinations" ON vaccinations FOR DELETE
TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('Vet', 'Grooming')),
  scheduled_at timestamptz NOT NULL,
  location text CHECK (location IS NULL OR char_length(location) <= 160),
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS appointments_dog_id_idx ON appointments (dog_id);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON appointments TO authenticated;

DROP POLICY IF EXISTS "select_own_appointments" ON appointments;
CREATE POLICY "select_own_appointments" ON appointments FOR SELECT
TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_appointments" ON appointments;
CREATE POLICY "insert_own_appointments" ON appointments FOR INSERT
TO authenticated WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_id AND d.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "update_own_appointments" ON appointments;
CREATE POLICY "update_own_appointments" ON appointments FOR UPDATE
TO authenticated USING (auth.uid() = owner_id)
WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_id AND d.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "delete_own_appointments" ON appointments;
CREATE POLICY "delete_own_appointments" ON appointments FOR DELETE
TO authenticated USING (auth.uid() = owner_id);
