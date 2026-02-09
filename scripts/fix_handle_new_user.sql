-- Fix the handle_new_user function that's causing JSON errors
-- This function is triggered when new users are created in auth.users

-- Step 1: View the current function definition
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Step 2: Drop the problematic trigger (if it exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Drop the problematic function
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Step 4: Create a FIXED version that handles empty/missing JSON properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
BEGIN
  -- Safely extract name from raw_user_meta_data
  BEGIN
    user_name := COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'name', ''),
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      SPLIT_PART(NEW.email, '@', 1)
    );
  EXCEPTION WHEN OTHERS THEN
    user_name := SPLIT_PART(NEW.email, '@', 1);
  END;

  -- Safely extract role from raw_user_meta_data
  BEGIN
    user_role := COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'role', ''),
      'PARENT'
    );
  EXCEPTION WHEN OTHERS THEN
    user_role := 'PARENT';
  END;

  -- Create user profile in public.users table
  INSERT INTO public.users (id, email, name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Verify the fix
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users'
  AND event_object_schema = 'auth'
  AND trigger_name = 'on_auth_user_created';
