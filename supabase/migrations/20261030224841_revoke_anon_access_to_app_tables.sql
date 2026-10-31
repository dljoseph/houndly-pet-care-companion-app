/*
# Remove anonymous access to Houndly tables

1. Changes
- Revokes all table permissions from the anonymous role on profiles, dogs, care_instructions, checklist_items, checklist_completions, vaccinations and appointments.

2. Why
- Every table already blocks anonymous visitors through row level security, but the platform grants the anonymous role access by default. Removing those permissions means only signed-in users can reach these tables at all.

3. Notes
- Signed-in access is unchanged.
*/

REVOKE ALL ON profiles, dogs, care_instructions, checklist_items, checklist_completions, vaccinations, appointments FROM anon;
