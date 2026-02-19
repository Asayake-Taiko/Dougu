-- Consolidated migration: Materialize related_org_members to a table for PowerSync visibility
-- Merges: 20260218181157, 20260218182500, and 20260218184500

-- 1. CLEANUP: Drop dependent storage policy and the view
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'View Shared Profile Images'
    ) THEN
        DROP POLICY "View Shared Profile Images" ON storage.objects;
    END IF;
END $$;

DROP VIEW IF EXISTS public.related_org_members;

-- 2. TABLE CREATION: Create physical table with UUIDs
CREATE TABLE public.related_org_members (
    viewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    PRIMARY KEY (viewer_id, target_user_id, organization_id)
);

-- Indexes for performance
CREATE INDEX related_org_members_viewer_id_idx ON public.related_org_members(viewer_id);
CREATE INDEX related_org_members_target_user_id_idx ON public.related_org_members(target_user_id);
CREATE INDEX related_org_members_organization_id_idx ON public.related_org_members(organization_id);

-- Enable RLS
ALTER TABLE public.related_org_members ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON public.related_org_members TO authenticated;
GRANT SELECT ON public.related_org_members TO service_role;
GRANT SELECT ON public.related_org_members TO powersync_role;

CREATE OR REPLACE FUNCTION public.handle_related_org_members_update()
RETURNS TRIGGER AS $$
DECLARE
    -- The system user for reassigned resources
    deleted_user_id CONSTANT UUID := 'd31e1e1e-d31e-d31e-d31e-d31e1e1e1e1e';
BEGIN
    -- OPTIMIZATION: Do not track relationships for the system deleted user.
    -- This prevents massive relationship overhead when many accounts are deleted.
    IF (NEW IS NOT NULL AND NEW.user_id = deleted_user_id) OR 
       (OLD IS NOT NULL AND OLD.user_id = deleted_user_id) THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Scenario: User Added to Organization
    IF (TG_OP = 'INSERT') THEN
        IF NEW.type = 'USER' AND NEW.user_id IS NOT NULL THEN
            -- Insert forward relationships: New User sees Existing Members
            INSERT INTO public.related_org_members (viewer_id, target_user_id, organization_id)
            SELECT NEW.user_id, om.user_id, NEW.organization_id
            FROM public.org_memberships om
            WHERE om.organization_id = NEW.organization_id
              AND om.type = 'USER'
              AND om.user_id IS NOT NULL
            ON CONFLICT DO NOTHING;

            -- Insert reverse relationships: Existing Members see New User
            INSERT INTO public.related_org_members (viewer_id, target_user_id, organization_id)
            SELECT om.user_id, NEW.user_id, NEW.organization_id
            FROM public.org_memberships om
            WHERE om.organization_id = NEW.organization_id
              AND om.type = 'USER'
              AND om.user_id IS NOT NULL
            ON CONFLICT DO NOTHING;
        END IF;

        RETURN NEW;
        
    -- Scenario: User Removed from Organization
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.user_id IS NOT NULL THEN
            DELETE FROM public.related_org_members
            WHERE organization_id = OLD.organization_id
              AND (viewer_id = OLD.user_id OR target_user_id = OLD.user_id);
        END IF;
          
        RETURN OLD;
        
    -- Scenario: Membership Updated
    ELSIF (TG_OP = 'UPDATE') THEN
        IF OLD.user_id IS DISTINCT FROM NEW.user_id 
           OR OLD.organization_id IS DISTINCT FROM NEW.organization_id 
           OR OLD.type IS DISTINCT FROM NEW.type THEN
           
            -- Remove old relationships
            IF OLD.user_id IS NOT NULL THEN
                 DELETE FROM public.related_org_members
                 WHERE organization_id = OLD.organization_id
                   AND (viewer_id = OLD.user_id OR target_user_id = OLD.user_id);
            END IF;
               
            -- Add new relationships
            IF NEW.type = 'USER' AND NEW.user_id IS NOT NULL THEN
                INSERT INTO public.related_org_members (viewer_id, target_user_id, organization_id)
                SELECT NEW.user_id, om.user_id, NEW.organization_id
                FROM public.org_memberships om
                WHERE om.organization_id = NEW.organization_id
                  AND om.type = 'USER'
                  AND om.user_id IS NOT NULL
                ON CONFLICT DO NOTHING;

                INSERT INTO public.related_org_members (viewer_id, target_user_id, organization_id)
                SELECT om.user_id, NEW.user_id, NEW.organization_id
                FROM public.org_memberships om
                WHERE om.organization_id = NEW.organization_id
                  AND om.type = 'USER'
                  AND om.user_id IS NOT NULL
                ON CONFLICT DO NOTHING;
            END IF;
        END IF;

        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Attach Trigger to org_memberships
DROP TRIGGER IF EXISTS trigger_maintain_related_org_members ON public.org_memberships;
CREATE TRIGGER trigger_maintain_related_org_members
AFTER INSERT OR UPDATE OR DELETE ON public.org_memberships
FOR EACH ROW EXECUTE FUNCTION public.handle_related_org_members_update();

-- 4. BACKFILL: Initial population of the table
INSERT INTO public.related_org_members (viewer_id, target_user_id, organization_id)
SELECT 
  my_om.user_id as viewer_id,
  other_om.user_id as target_user_id,
  other_om.organization_id
FROM org_memberships my_om
JOIN org_memberships other_om ON my_om.organization_id = other_om.organization_id
WHERE my_om.type = 'USER' AND other_om.type = 'USER'
  AND my_om.user_id IS NOT NULL AND other_om.user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 5. POLICIES: RLS for the new table and storage
CREATE POLICY "Users can view their own related members"
ON public.related_org_members FOR SELECT
TO authenticated
USING (viewer_id = auth.uid());

CREATE POLICY "View Shared Profile Images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'images'
  AND EXISTS (
    SELECT 1 
    FROM public.related_org_members rom
    WHERE rom.viewer_id = auth.uid()
    AND name LIKE 'profiles/' || rom.target_user_id || '/%'
  )
);
-- 6. PUBLICATION: Ensure PowerSync can see the table
ALTER PUBLICATION powersync ADD TABLE public.related_org_members;
