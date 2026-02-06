import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createPowerSyncClient, createClient } from "../utils/powersync_utils";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { waitFor, generateTestUser, createOrganization, createContainer, createEquipment, joinOrg, getMembershipId } from "../utils/helper";

describe("PowerSync Write Operations", () => {
  let db: any;
  const tempDir = join(__dirname, ".temp");

  const getDbPath = (name: string) => join(tempDir, `${name}.db`);

  async function cleanupDb(dbInstance: any, name: string) {
    if (dbInstance) await dbInstance.disconnect().catch(() => { });
    const dbPath = getDbPath(name);
    const files = [dbPath, `${dbPath}-wal`, `${dbPath}-shm`];
    files.forEach(f => {
      if (existsSync(f)) {
        try { unlinkSync(f); } catch (e) { }
      }
    });
  }

  beforeAll(() => {
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
  });

  afterAll(async () => {
    if (db) await db.disconnect().catch(() => { });
  });

  beforeEach(async () => {
    if (db) {
      await db.disconnect().catch(() => { });
      db = null;
    }
  });

  it("PATCH: Reassigning equipment using PowerSync updates data in Supabase", async () => {
    const user = await generateTestUser();
    const userB = await generateTestUser();
    const org = await createOrganization(user.token, "Test Org");
    const equipment = await createEquipment(user.token, org.id, "Test Equipment");

    // Add userB to the org
    await joinOrg(userB.token, org.id, userB.user.id);

    db = await createPowerSyncClient(user.token, getDbPath("test_patch_equipment"));

    try {
      // Wait for equipment to sync
      await waitFor(async () => {
        const results = await db.getAll('SELECT * FROM equipment WHERE id = ?', [equipment.id]);
        return results.length > 0;
      });

      const now = new Date().toISOString();
      const membershipId = await getMembershipId(user.token, org.id, userB.user.id);

      // Update equipment assignment via PowerSync (PATCH operation)
      await db.writeTransaction(async (tx: any) => {
        await tx.execute(
          "UPDATE equipment SET assigned_to = ?, last_updated_date = ? WHERE id = ?",
          [membershipId, now, equipment.id]
        );
      });

      // Wait for the change to sync to Supabase
      await waitFor(async () => {
        const userClient = createClient(user.token);
        const { data } = await userClient
          .from('equipment')
          .select('assigned_to, last_updated_date')
          .eq('id', equipment.id)
          .single();

        return data?.assigned_to === membershipId;
      });

      // Verify in Supabase
      const userClient = createClient(user.token);
      const { data: supabaseData } = await userClient
        .from('equipment')
        .select('*')
        .eq('id', equipment.id)
        .single();

      expect(supabaseData?.assigned_to).toBe(membershipId);
      expect(supabaseData?.last_updated_date).toBeTruthy();
    } finally {
      await cleanupDb(db, "test_patch_equipment");
      db = null;
    }
  });

  it("PATCH: Reassigning container using PowerSync updates data in Supabase", async () => {
    const user = await generateTestUser();
    const userB = await generateTestUser();
    const org = await createOrganization(user.token, "Test Org");
    const container = await createContainer(user.token, org.id, "Test Container");

    // Add userB to the org
    await joinOrg(userB.token, org.id, userB.user.id);

    db = await createPowerSyncClient(user.token, getDbPath("test_patch_container"));

    try {
      // Wait for container to sync
      await waitFor(async () => {
        const results = await db.getAll('SELECT * FROM containers WHERE id = ?', [container.id]);
        return results.length > 0;
      });

      const now = new Date().toISOString();
      const membershipId = await getMembershipId(user.token, org.id, userB.user.id);

      // Update container assignment via PowerSync (PATCH operation)
      await db.writeTransaction(async (tx: any) => {
        await tx.execute(
          "UPDATE containers SET assigned_to = ?, last_updated_date = ? WHERE id = ?",
          [membershipId, now, container.id]
        );
      });

      // Wait for the change to sync to Supabase
      await waitFor(async () => {
        const userClient = createClient(user.token);
        const { data } = await userClient
          .from('containers')
          .select('assigned_to')
          .eq('id', container.id)
          .single();

        return data?.assigned_to === membershipId;
      });

      // Verify in Supabase
      const userClient = createClient(user.token);
      const { data: supabaseData } = await userClient
        .from('containers')
        .select('*')
        .eq('id', container.id)
        .single();

      expect(supabaseData?.assigned_to).toBe(membershipId);
      expect(supabaseData?.last_updated_date).toBeTruthy();
    } finally {
      await cleanupDb(db, "test_patch_container");
      db = null;
    }
  });

  it("PATCH: Batch update equipment in container using PowerSync updates data in Supabase", async () => {
    const user = await generateTestUser();
    const userB = await generateTestUser();
    const org = await createOrganization(user.token, "Test Org");
    const container = await createContainer(user.token, org.id, "Test Container");
    const equipment1 = await createEquipment(user.token, org.id, "Equipment 1");
    const equipment2 = await createEquipment(user.token, org.id, "Equipment 2");

    // Add userB to the org
    await joinOrg(userB.token, org.id, userB.user.id);

    // Assign equipment to container first
    const userClient = createClient(user.token);
    await userClient.from('equipment').update({ container_id: container.id }).eq('id', equipment1.id);
    await userClient.from('equipment').update({ container_id: container.id }).eq('id', equipment2.id);

    db = await createPowerSyncClient(user.token, getDbPath("test_batch_update"));

    try {
      // Wait for equipment to sync
      await waitFor(async () => {
        const results = await db.getAll('SELECT * FROM equipment WHERE container_id = ?', [container.id]);
        return results.length === 2;
      });

      const now = new Date().toISOString();
      const membershipId = await getMembershipId(user.token, org.id, userB.user.id);

      // Batch update all equipment in container via PowerSync
      await db.writeTransaction(async (tx: any) => {
        await tx.execute(
          "UPDATE equipment SET assigned_to = ?, last_updated_date = ? WHERE container_id = ?",
          [membershipId, now, container.id]
        );
      });

      // Wait for changes to sync to Supabase
      await waitFor(async () => {
        const { data } = await userClient
          .from('equipment')
          .select('assigned_to')
          .eq('container_id', container.id);

        return data?.every(e => e.assigned_to === membershipId) ?? false;
      });

      // Verify in Supabase
      const { data: supabaseData } = await userClient
        .from('equipment')
        .select('*')
        .eq('container_id', container.id);

      expect(supabaseData?.length).toBe(2);
      expect(supabaseData?.every(e => e.assigned_to === membershipId)).toBe(true);
    } finally {
      await cleanupDb(db, "test_batch_update");
      db = null;
    }
  });

  it("PUT: Creating new equipment via PowerSync syncs to Supabase", async () => {
    const user = await generateTestUser();
    const org = await createOrganization(user.token, "Test Org");

    db = await createPowerSyncClient(user.token, getDbPath("test_put_equipment"));

    try {
      // Wait for org to sync
      await waitFor(async () => {
        const results = await db.getAll('SELECT * FROM organizations WHERE id = ?', [org.id]);
        return results.length > 0;
      });

      const newEquipmentId = randomUUID();
      const now = new Date().toISOString();

      // Create new equipment via PowerSync (PUT/upsert operation)
      await db.writeTransaction(async (tx: any) => {
        await tx.execute(
          "INSERT INTO equipment (id, name, organization_id, last_updated_date) VALUES (?, ?, ?, ?)",
          [newEquipmentId, "PowerSync Equipment", org.id, now]
        );
      });

      // Wait for the new equipment to appear in Supabase
      await waitFor(async () => {
        const userClient = createClient(user.token);
        const { data } = await userClient
          .from('equipment')
          .select('*')
          .eq('id', newEquipmentId)
          .single();

        return data !== null;
      });

      // Verify in Supabase
      const userClient = createClient(user.token);
      const { data: supabaseData } = await userClient
        .from('equipment')
        .select('*')
        .eq('id', newEquipmentId)
        .single();

      expect(supabaseData?.name).toBe("PowerSync Equipment");
      expect(supabaseData?.organization_id).toBe(org.id);
    } finally {
      await cleanupDb(db, "test_put_equipment");
      db = null;
    }
  });

  it("DELETE: Deleting equipment via PowerSync removes from Supabase", async () => {
    const user = await generateTestUser();
    const org = await createOrganization(user.token, "Test Org");
    const equipment = await createEquipment(user.token, org.id, "To Delete");

    db = await createPowerSyncClient(user.token, getDbPath("test_delete_equipment"));

    try {
      // Wait for equipment to sync
      await waitFor(async () => {
        const results = await db.getAll('SELECT * FROM equipment WHERE id = ?', [equipment.id]);
        return results.length > 0;
      });

      // Delete equipment via PowerSync
      await db.writeTransaction(async (tx: any) => {
        await tx.execute("DELETE FROM equipment WHERE id = ?", [equipment.id]);
      });

      // Wait for deletion to sync to Supabase
      await waitFor(async () => {
        const userClient = createClient(user.token);
        const { data } = await userClient
          .from('equipment')
          .select('*')
          .eq('id', equipment.id)
          .single();

        return data === null;
      });

      // Verify deletion in Supabase
      const userClient = createClient(user.token);
      const { data: supabaseData } = await userClient
        .from('equipment')
        .select('*')
        .eq('id', equipment.id)
        .single();

      expect(supabaseData).toBeNull();
    } finally {
      await cleanupDb(db, "test_delete_equipment");
      db = null;
    }
  });

  it("PATCH: Multiple sequential equipment updates sync correctly", async () => {
    const user = await generateTestUser();
    const userB = await generateTestUser();
    const userC = await generateTestUser();
    const org = await createOrganization(user.token, "Test Org");
    const equipment = await createEquipment(user.token, org.id, "Multi Update");

    await joinOrg(userB.token, org.id, userB.user.id);
    await joinOrg(userC.token, org.id, userC.user.id);

    db = await createPowerSyncClient(user.token, getDbPath("test_multi_update"));

    try {
      // Wait for equipment to sync
      await waitFor(async () => {
        const results = await db.getAll('SELECT * FROM equipment WHERE id = ?', [equipment.id]);
        return results.length > 0;
      });

      const membershipIdB = await getMembershipId(user.token, org.id, userB.user.id);
      const membershipIdC = await getMembershipId(user.token, org.id, userC.user.id);

      // First update
      await db.writeTransaction(async (tx: any) => {
        await tx.execute(
          "UPDATE equipment SET assigned_to = ?, last_updated_date = ? WHERE id = ?",
          [membershipIdB, new Date().toISOString(), equipment.id]
        );
      });

      await waitFor(async () => {
        const userClient = createClient(user.token);
        const { data } = await userClient
          .from('equipment')
          .select('assigned_to')
          .eq('id', equipment.id)
          .single();
        return data?.assigned_to === membershipIdB;
      });

      // Second update
      await db.writeTransaction(async (tx: any) => {
        await tx.execute(
          "UPDATE equipment SET assigned_to = ?, last_updated_date = ? WHERE id = ?",
          [membershipIdC, new Date().toISOString(), equipment.id]
        );
      });

      await waitFor(async () => {
        const userClient = createClient(user.token);
        const { data } = await userClient
          .from('equipment')
          .select('assigned_to')
          .eq('id', equipment.id)
          .single();
        return data?.assigned_to === membershipIdC;
      });

      // Verify final state in Supabase
      const userClient = createClient(user.token);
      const { data: supabaseData } = await userClient
        .from('equipment')
        .select('*')
        .eq('id', equipment.id)
        .single();

      expect(supabaseData?.assigned_to).toBe(membershipIdC);
    } finally {
      await cleanupDb(db, "test_multi_update");
      db = null;
    }
  });
});