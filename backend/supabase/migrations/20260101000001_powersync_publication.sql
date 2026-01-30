-- Create publication for PowerSync
-- We want to replicate all tables in the public schema.
-- Note: "FOR ALL TABLES" requires superuser and replicates all schemas. 
-- "FOR TABLES IN SCHEMA public" is usually safer and sufficient for Supabase projects.
-- However, "FOR TABLES IN SCHEMA" was introduced in PG 15.
-- Supabase local is PG 15+.

DROP PUBLICATION IF EXISTS powersync;
CREATE PUBLICATION powersync FOR TABLES IN SCHEMA public;
