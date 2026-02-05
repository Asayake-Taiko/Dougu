/**
 * Global Profile Identity (Mirrored from Supabase Auth)
 */
export interface ProfileRecord {
  id: string;
  name: string;
  profile_image: string;
  color: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Organization Entity
 */
export interface OrganizationRecord {
  id: string;
  name: string;
  access_code: string;
  manager_id: string;
  image: string;
  color: string;
  created_at?: string;
}

/**
 * Membership Junction (Handles both Users and Storage Nodes)
 */
export interface OrgMembershipRecord {
  id: string;
  organization_id: string;
  type: "USER" | "STORAGE";
  user_id?: string; // Present if type === 'USER'
  storage_name?: string; // Present if type === 'STORAGE'
  profile_image?: string; // Present if type === 'STORAGE'
  color?: string;
  details?: string;
}

/**
 * Physical Containers
 */
export interface ContainerRecord {
  id: string;
  name: string;
  organization_id: string;
  assigned_to: string;
  color: string;
  details?: string;
  last_updated_date: string;
}

/**
 * Individual Equipment Items
 */
export interface EquipmentRecord {
  id: string;
  name: string;
  organization_id: string;
  assigned_to: string;
  container_id?: string;
  image: string;
  color: string;
  details?: string;
  last_updated_date: string;
}
