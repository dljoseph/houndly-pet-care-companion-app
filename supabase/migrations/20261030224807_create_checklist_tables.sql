/*
# Create care instructions, checklist items and daily completions

1. New Tables
- care_instructions: the pasted care text for a dog (up to 4,000 characters), kept so the checklist can be traced back to it.
- checklist_items: each task on a dog's checklist. Fields: title, category, amount, time slots (Morning, Afternoon, Evening), repeat (daily or once), start and end dates, notes, the original quote it came from, and whether it needs confirmation with an ambiguity question.
- checklist_completions: a record that a task was ticked off for a given day and slot. Each task can be ticked once per day per slot.

2. Security
- Row level security is enabled on all three tables.
- Every row has owner_id set to the signed-in user. Users can only read and change their own rows.
- Each row must link to a dog the user owns, so tasks cannot be attached to someone else's dog.
- Anonymous visitors have no access.

3. Notes
- Deleting a dog removes its instructions, checklist items and completions.
- Deleting a checklist item removes its completions.
*/

CREATE TABLE IF NOT EXISTS care_instructions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  source_text text NOT NULL CHECK (char_length(source_text) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS care_instructions_dog_id_idx ON care_instructions (dog_id);

ALTER TABLE care_instructions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON care_instructions TO authenticated;

DROP POLICY IF EXISTS "select_own_care_instructions" ON care_instructions;
CREATE POLICY "select_own_care_instructions" ON care_instructions FOR SELECT
TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_care_instructions" ON care_instructions;
CREATE POLICY "insert_own_care_instructions" ON care_instructions FOR INSERT
TO authenticated WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_id AND d.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "update_own_care_instructions" ON care_instructions;
CREATE POLICY "update_own_care_instructions" ON care_instructions FOR UPDATE
TO authenticated USING (auth.uid() = owner_id)
WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_id AND d.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "delete_own_care_instructions" ON care_instructions;
CREATE POLICY "delete_own_care_instructions" ON care_instructions FOR DELETE
TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE IF NOT EXISTS checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  dog_id uuid NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
  care_instruction_id uuid REFERENCES care_instructions(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
  category text CHECK (category IS NULL OR char_length(category) <= 60),
  amount text CHECK (amount IS NULL OR char_length(amount) <= 120),
  slots text[] NOT NULL DEFAULT '{}' CHECK (
    cardinality(slots) > 0 AND slots <@ ARRAY['Morning', 'Afternoon', 'Evening']::text[]
  ),
  frequency text NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'once')),
  start_date date NOT NULL,
  end_date date,
  notes text CHECK (notes IS NULL OR char_length(notes) <= 1000),
  source_quote text CHECK (source_quote IS NULL OR char_length(source_quote) <= 500),
  needs_confirmation boolean NOT NULL DEFAULT false,
  ambiguity_question text CHECK (ambiguity_question IS NULL OR char_length(ambiguity_question) <= 300),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS checklist_items_dog_id_idx ON checklist_items (dog_id);
CREATE INDEX IF NOT EXISTS checklist_items_care_instruction_id_idx ON checklist_items (care_instruction_id);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON checklist_items TO authenticated;

DROP POLICY IF EXISTS "select_own_checklist_items" ON checklist_items;
CREATE POLICY "select_own_checklist_items" ON checklist_items FOR SELECT
TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_checklist_items" ON checklist_items;
CREATE POLICY "insert_own_checklist_items" ON checklist_items FOR INSERT
TO authenticated WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_id AND d.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "update_own_checklist_items" ON checklist_items;
CREATE POLICY "update_own_checklist_items" ON checklist_items FOR UPDATE
TO authenticated USING (auth.uid() = owner_id)
WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (SELECT 1 FROM dogs d WHERE d.id = dog_id AND d.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "delete_own_checklist_items" ON checklist_items;
CREATE POLICY "delete_own_checklist_items" ON checklist_items FOR DELETE
TO authenticated USING (auth.uid() = owner_id);

CREATE TABLE IF NOT EXISTS checklist_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  due_date date NOT NULL,
  slot text NOT NULL CHECK (slot IN ('Morning', 'Afternoon', 'Evening')),
  completed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT checklist_completions_item_due_slot_key UNIQUE (item_id, due_date, slot)
);

CREATE INDEX IF NOT EXISTS checklist_completions_owner_due_idx ON checklist_completions (owner_id, due_date);

ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON checklist_completions TO authenticated;

DROP POLICY IF EXISTS "select_own_checklist_completions" ON checklist_completions;
CREATE POLICY "select_own_checklist_completions" ON checklist_completions FOR SELECT
TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "insert_own_checklist_completions" ON checklist_completions;
CREATE POLICY "insert_own_checklist_completions" ON checklist_completions FOR INSERT
TO authenticated WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (SELECT 1 FROM checklist_items i WHERE i.id = item_id AND i.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "update_own_checklist_completions" ON checklist_completions;
CREATE POLICY "update_own_checklist_completions" ON checklist_completions FOR UPDATE
TO authenticated USING (auth.uid() = owner_id)
WITH CHECK (
  auth.uid() = owner_id
  AND EXISTS (SELECT 1 FROM checklist_items i WHERE i.id = item_id AND i.owner_id = auth.uid())
);

DROP POLICY IF EXISTS "delete_own_checklist_completions" ON checklist_completions;
CREATE POLICY "delete_own_checklist_completions" ON checklist_completions FOR DELETE
TO authenticated USING (auth.uid() = owner_id);
