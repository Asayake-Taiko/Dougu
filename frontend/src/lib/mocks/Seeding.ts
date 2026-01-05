import { PowerSyncDatabase } from "@powersync/react-native";
import {
  MOCK_USERS,
  MOCK_ORGS,
  MOCK_MEMBERSHIPS,
  MOCK_CONTAINERS,
  MOCK_EQUIPMENT,
} from "./SeedingData";
import { Queries } from "../powersync/queries";

/**
 * Seeds the database with mock data.
 * It clears existing data first to ensure the database matches the mock data exactly.
 */
export async function seedDatabase(db: PowerSyncDatabase) {
  await db.writeTransaction(async (tx) => {
    // Clear existing data from all relevant tables
    await tx.execute(Queries.Equipment.deleteAll);
    await tx.execute(Queries.Container.deleteAll);
    await tx.execute(Queries.Membership.deleteAll);
    await tx.execute(Queries.Organization.deleteAll);
    await tx.execute(Queries.User.deleteAll);

    // Insert Users
    for (const user of MOCK_USERS) {
      await tx.execute(Queries.User.insert, [
        user.id,
        user.email,
        user.full_name,
        user.profile,
        user.created_at,
        user.updated_at,
      ]);
    }

    // Insert Organizations
    for (const org of MOCK_ORGS) {
      await tx.execute(Queries.Organization.insert, [
        org.id,
        org.name,
        org.access_code,
        org.manager_id,
        org.image,
        org.created_at,
      ]);
    }

    // Insert Memberships
    for (const membership of MOCK_MEMBERSHIPS) {
      await tx.execute(Queries.Membership.insert, [
        membership.id,
        membership.organization_id,
        membership.type,
        membership.user_id || null,
        membership.storage_name || null,
        membership.profile || null,
        membership.details || null,
      ]);
    }

    // Insert Containers
    for (const container of MOCK_CONTAINERS) {
      await tx.execute(Queries.Container.insert, [
        container.id,
        container.name,
        container.organization_id,
        container.assigned_to,
        container.color,
        container.details || null,
        container.last_updated_date,
      ]);
    }

    // Insert Equipment
    for (const gear of MOCK_EQUIPMENT) {
      await tx.execute(Queries.Equipment.insert, [
        gear.id,
        gear.name,
        gear.organization_id,
        gear.assigned_to,
        gear.container_id || null,
        gear.image,
        gear.color,
        gear.details || null,
        gear.last_updated_date,
      ]);
    }
  });
}
