export const Queries = {
  User: {
    getById: "SELECT * FROM users WHERE id = ?",
    getByEmail: "SELECT * FROM users WHERE email = ?",
    insert:
      "INSERT INTO users (id, email, full_name, profile, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
    deleteByEmail: "DELETE FROM users WHERE email = ?",
    deleteAll: "DELETE FROM users",
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
      "INSERT INTO organizations (id, name, access_code, manager_id, image, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    deleteAll: "DELETE FROM organizations",
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
      "INSERT INTO org_memberships (id, organization_id, type, user_id, storage_name, profile, details) VALUES (?, ?, ?, ?, ?, ?, ?)",
    deleteAll: "DELETE FROM org_memberships",
  },
  Container: {
    getAllByOrg: "SELECT * FROM containers WHERE organization_id = ?",
    insert:
      "INSERT INTO containers (id, name, organization_id, assigned_to, color, details, last_updated_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
    updateAssignment:
      "UPDATE containers SET assigned_to = ?, last_updated_date = ? WHERE id = ?",
    delete: "DELETE FROM containers WHERE id = ?",
    deleteEquipmentIn: "DELETE FROM equipment WHERE container_id = ?",
    deleteAll: "DELETE FROM containers",
  },
  Equipment: {
    getAllByOrg: "SELECT * FROM equipment WHERE organization_id = ?",
    insert:
      "INSERT INTO equipment (id, name, organization_id, assigned_to, container_id, image, color, details, last_updated_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    insertWithoutContainer:
      "INSERT INTO equipment (id, name, organization_id, assigned_to, image, color, details, last_updated_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    updateAssignment:
      "UPDATE equipment SET assigned_to = ?, container_id = ?, last_updated_date = ? WHERE id = ?",
    delete: "DELETE FROM equipment WHERE id = ?",
    deleteAll: "DELETE FROM equipment",

    // Batch update helper for container re-assignment (if needed directly)
    updateAssignmentByContainer:
      "UPDATE equipment SET assigned_to = ?, last_updated_date = ? WHERE container_id = ?",
  },
};
