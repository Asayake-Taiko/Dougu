import { PowerSyncDatabase } from "@powersync/react-native";
import {
  MOCK_USERS,
  MOCK_ORGS,
  MOCK_MEMBERSHIPS,
  MOCK_CONTAINERS,
  MOCK_EQUIPMENT,
} from "./SeedingData";

/**
 * Seeds the database with mock data.
 * It clears existing data first to ensure the database matches the mock data exactly.
 */
export async function seedDatabase(db: PowerSyncDatabase) {
  await db.writeTransaction(async (tx) => {
    // Clear existing data from all relevant tables
    const tables = [
      "users",
      "organizations",
      "org_memberships",
      "containers",
      "equipment",
    ];
    for (const table of tables) {
      await tx.execute(`DELETE FROM ${table}`);
    }

    // Insert Users
    for (const user of MOCK_USERS) {
      await tx.execute(
        "INSERT INTO users (id, email, full_name, profile, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
        [
          user.id,
          user.email,
          user.full_name,
          user.profile,
          user.created_at,
          user.updated_at,
        ],
      );
    }

    // Insert Organizations
    for (const org of MOCK_ORGS) {
      await tx.execute(
        "INSERT INTO organizations (id, name, access_code, manager_id, image, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [
          org.id,
          org.name,
          org.access_code,
          org.manager_id,
          org.image,
          org.created_at,
        ],
      );
    }

    // Insert Memberships
    for (const membership of MOCK_MEMBERSHIPS) {
      await tx.execute(
        "INSERT INTO org_memberships (id, organization_id, type, user_id, group_name, profile, details) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          membership.id,
          membership.organization_id,
          membership.type,
          membership.user_id,
          membership.group_name,
          membership.profile,
          membership.details,
        ],
      );
    }

    // Insert Containers
    for (const container of MOCK_CONTAINERS) {
      await tx.execute(
        "INSERT INTO containers (id, name, organization_id, assigned_to, color, group_name, details, last_updated_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          container.id,
          container.name,
          container.organization_id,
          container.assigned_to,
          container.color,
          container.group_name,
          container.details,
          container.last_updated_date,
        ],
      );
    }

    // Insert Equipment
    for (const gear of MOCK_EQUIPMENT) {
      await tx.execute(
        "INSERT INTO equipment (id, name, organization_id, assigned_to, container_id, image, color, group_name, details, last_updated_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          gear.id,
          gear.name,
          gear.organization_id,
          gear.assigned_to,
          gear.container_id,
          gear.image,
          gear.color,
          gear.group_name,
          gear.details,
          gear.last_updated_date,
        ],
      );
    }
  });
}
