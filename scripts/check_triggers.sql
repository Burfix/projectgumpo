-- Check Database Triggers for JSON Error
-- Run this in Supabase SQL Editor to diagnose the invite issue

-- Query 1: Check all triggers on auth.users table
SELECT 
    'auth.users triggers' as table_name,
    trigger_name,
    event_manipulation as event,
    action_timing as timing,
    action_statement as function_call
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- Query 2: Check all triggers on public.users table
SELECT 
    'public.users triggers' as table_name,
    trigger_name,
    event_manipulation as event,
    action_timing as timing,
    action_statement as function_call
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'users'
ORDER BY trigger_name;

-- Query 3: Check trigger functions that might be problematic
SELECT 
    n.nspname as schema_name,
    p.proname as function_name,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname LIKE '%user%'
  OR p.proname LIKE '%profile%'
  OR p.proname LIKE '%handle%'
ORDER BY n.nspname, p.proname;

-- Query 4: Check for functions that might be trying to parse JSON
SELECT 
    routine_schema,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_definition ILIKE '%json%'
  AND routine_schema IN ('public', 'auth')
ORDER BY routine_name;

-- Query 5: Check if there's a handle_new_user function
SELECT EXISTS(
    SELECT 1 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE p.proname = 'handle_new_user'
) as has_handle_new_user_function;

-- SOLUTION: If you find a problematic trigger, you can disable it temporarily:
-- DROP TRIGGER IF EXISTS trigger_name ON auth.users;
-- DROP TRIGGER IF EXISTS trigger_name ON public.users;

-- Or disable the trigger function:
-- DROP FUNCTION IF EXISTS function_name CASCADE;
