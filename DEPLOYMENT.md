# Vercel deployment

1. Add Production environment variables in Vercel project settings:
   - `SUPABASE_URL`: `https://tgzrytgoyyeztkiprrqy.supabase.co`
   - `SUPABASE_PUBLISHABLE_KEY`: the Supabase publishable key (or legacy anon key).
   These names do not require a public-prefix Config control. The build explicitly
   includes these public credentials in the browser; marking them sensitive in
   Vercel does not make the deployed values private. Never supply a secret or service-role key.
   Existing local `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` remain supported.
2. Deploy the updated code using Vite, `npm run build`, output `dist`.
   Missing credentials or private keys stop the build with a readable error.
3. In Supabase Authentication > Users, create your account with an email and password.
   The old local SQLite account is not a Supabase user.
4. Approve that specific account in the Supabase SQL Editor, replacing the email:

   ```sql
   update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"ADMIN"}'::jsonb
   where email = 'YOUR_ACCOUNT_EMAIL';
   ```

   Confirm exactly one row was updated. Sign out and sign back in after changing approval.
   Approval belongs in app metadata, never user metadata. Unapproved accounts and
   anonymous visitors have no access to business tables.
5. Log in using your full email and password. Verify a record can be saved and
   still appears after reloading before using the site for business transactions.

The live project access policy was hardened during this fix. For a different
existing project, apply `supabase/secure-access.sql`; for a new project use
`supabase/schema.sql`. The access model currently approves ADMIN accounts only.

## Known production limitations

Several business stores still fall back to local/in-memory data after cloud write
errors, and payroll runs are not persisted in Supabase. These workflows need
further work before the entire system can be considered production-ready.
