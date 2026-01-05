export const Queries = {
  User: {
    getById: "SELECT * FROM users WHERE id = ?",
    getByEmail: "SELECT * FROM users WHERE email = ?",
    insert:
      "INSERT INTO users (id, email, full_name, profile, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    deleteByEmail: "DELETE FROM users WHERE email = ?",
    updateName: "UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?",
    updateEmail: "UPDATE users SET email = ?, updated_at = ? WHERE id = ?",
    updateProfile: "UPDATE users SET profile = ?, updated_at = ? WHERE id = ?",
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
    checkIdByCode: "SELECT id FROM organizations WHERE access_code = ?",
    checkIdByName: "SELECT id FROM organizations WHERE name = ?",
    getByAccessCode: "SELECT * FROM organizations WHERE access_code = ?",
    insert:
      "INSERT INTO organizations (id, name, access_code, manager_id, created_at) VALUES (?, ?, ?, ?, ?)",
    updateImage: "UPDATE organizations SET image = ? WHERE id = ?",
  },
  Membership: {
    getAllByOrg: `
            SELECT m.*, u.full_name, u.profile as user_profile
            FROM org_memberships m 
            LEFT JOIN users u ON m.user_id = u.id
            WHERE m.organization_id = ?
        `,
    getByOrgAndUser:
      "SELECT * FROM org_memberships WHERE organization_id = ? AND user_id = ?",
    getDetailsByOrgAndUser: `
            SELECT m.*, u.full_name, u.profile as user_profile
            FROM org_memberships m 
            LEFT JOIN users u ON m.user_id = u.id 
            WHERE m.organization_id = ? AND m.user_id = ?`,
    insert:
      "INSERT INTO org_memberships (id, organization_id, user_id, type) VALUES (?, ?, ?, ?)",
  },
  Container: {
    getAllByOrg: "SELECT * FROM containers WHERE organization_id = ?",
    updateAssignment:
      "UPDATE containers SET assigned_to = ?, last_updated_date = ? WHERE id = ?",
    delete: "DELETE FROM containers WHERE id = ?",
    deleteEquipmentIn: "DELETE FROM equipment WHERE container_id = ?",
  },
  Equipment: {
    getAllByOrg: "SELECT * FROM equipment WHERE organization_id = ?",
    updateAssignment:
      "UPDATE equipment SET assigned_to = ?, container_id = ?, last_updated_date = ? WHERE id = ?",
    delete: "DELETE FROM equipment WHERE id = ?",

    // Batch update helper for container re-assignment (if needed directly)
    updateAssignmentByContainer:
      "UPDATE equipment SET assigned_to = ?, last_updated_date = ? WHERE container_id = ?",
  },
};
