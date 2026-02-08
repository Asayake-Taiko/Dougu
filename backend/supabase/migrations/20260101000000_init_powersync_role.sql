-- Create a role/user with replication privileges for PowerSync
-- We use a DO block to check if the role exists, because roles are cluster-global
-- and might persist across db resets, preventing a simple CREATE ROLE from working
-- if it's already there (and CREATE ROLE IF NOT EXISTS is not standard in all PG versions/contexts or simpler to handle this way)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'powersync_role') THEN
    CREATE ROLE powersync_role WITH REPLICATION BYPASSRLS LOGIN PASSWORD 'myhighlyrandompassword';
  END IF;
END
$$;

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO powersync_role;

-- Grant SELECT on all future tables (to cater for schema additions)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO powersync_role;

-- Note: Explicit GRANT SELECT on existing tables is handled by the schema migration (e.g. 20260127000119...)
-- which runs after this if we name this file with an earlier timestamp.
