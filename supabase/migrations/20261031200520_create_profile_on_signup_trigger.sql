/*
# Create profile automatically for each new account

1. What changes
- Adds a database function that creates a profiles row whenever a new account is created, whether by email and password or by Google.
- The display name is taken from the account's name when one is provided (for example from Google), and is left empty otherwise.
- Adds a trigger that runs this function after each new account is created.

2. Security
- The function runs with elevated rights so it can write the profile before the user has a session.
- Only the account system can run it. Signed-in users and anonymous visitors cannot call it directly.
- The search path is fixed to the public schema to prevent name-hijacking.

3. Notes
- If a profile already exists for the account, nothing is changed.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    NULLIF(left(btrim(COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')), 80), '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
