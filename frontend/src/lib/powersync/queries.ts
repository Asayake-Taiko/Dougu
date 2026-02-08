export const Queries = {
  Profile: {
    getById: "SELECT * FROM profiles WHERE id = ?",
    updateName: "UPDATE profiles SET name = ?, updated_at = ? WHERE id = ?",
    updateProfile:
      "UPDATE profiles SET profile_image = ?, updated_at = ? WHERE id = ?",
  },
  Organization: {
    getById: "SELECT * FROM organizations WHERE id = ?",
    getAllForUser: `
            SELECT
                o.*
            FROM
                organizations o
            JOIN
                org_memberships m ON o.id = m.organization_id
            WHERE
                m.user_id = ?`,
  },
  Membership: {
    getAllByOrg: `
            SELECT m.*, p.name, p.profile_image as user_profile, p.color as user_color
            FROM org_memberships m 
            LEFT JOIN profiles p ON m.user_id = p.id
            WHERE m.organization_id = ?
        `,
    getDetailsByOrgAndUser: `
            SELECT m.*, p.name, p.profile_image as user_profile, p.color as user_color
            FROM org_memberships m 
            LEFT JOIN profiles p ON m.user_id = p.id 
            WHERE m.organization_id = ? AND m.user_id = ?`,
  },
  Container: {
    getAllByOrg: "SELECT * FROM containers WHERE organization_id = ?",
    updateAssignment:
      "UPDATE containers SET assigned_to = ?, last_updated_date = ? WHERE id = ?",
  },
  Equipment: {
    getAllByOrg: "SELECT * FROM equipment WHERE organization_id = ?",
    updateAssignment:
      "UPDATE equipment SET assigned_to = ?, container_id = ?, last_updated_date = ? WHERE id = ?",

    // Batch update helper for container re-assignment (if needed directly)
    updateAssignmentByContainer:
      "UPDATE equipment SET assigned_to = ?, last_updated_date = ? WHERE container_id = ?",
  },
};
