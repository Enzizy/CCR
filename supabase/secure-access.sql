DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['customers','products','purchase_orders','delivery_trips','delivery_receipts','delivery_issues','statements_of_account','payments','expenses','employees','cash_advances','settings']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('DROP POLICY IF EXISTS "allow_all_for_internal_app" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "approved_staff_access" ON public.%I', t);
    EXECUTE format('CREATE POLICY "approved_staff_access" ON public.%I FOR ALL TO authenticated USING ((select auth.jwt() -> ''app_metadata'' ->> ''role'') = ''ADMIN'') WITH CHECK ((select auth.jwt() -> ''app_metadata'' ->> ''role'') = ''ADMIN'')', t);
  END LOOP;
END $$;

-- The hosted project's DDL event trigger is not a client-callable API.
DO $$ BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;
