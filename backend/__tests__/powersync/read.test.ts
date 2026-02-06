
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { createPowerSyncClient } from "../utils/powersync_utils";
import { waitFor, generateTestUser, createOrganization, createContainer, createEquipment, joinOrg, removeMembership } from "../utils/helper";
import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { join } from "node:path";

describe("PowerSync Sync Rules", () => {
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

  it("User has data of (equipment/container/membership/profile) of an organization they are a part of", async () => {
    const user = await generateTestUser();
    const org = await createOrganization(user.token, "My Org");
    const container = await createContainer(user.token, org.id, "My Container");
    const equipment = await createEquipment(user.token, org.id, "My Equipment");

    db = await createPowerSyncClient(user.token, getDbPath("test_member"));

    try {
      // Wait for org to sync
      await waitFor(async () => {
        const results = await db.getAll('SELECT * FROM organizations WHERE id = ?', [org.id]);
        return results.length > 0;
      });

      const containers = await db.getAll('SELECT * FROM containers WHERE id = ?', [container.id]);
      const equipments = await db.getAll('SELECT * FROM equipment WHERE id = ?', [equipment.id]);
      const memberships = await db.getAll('SELECT * FROM org_memberships WHERE organization_id = ? AND user_id = ?', [org.id, user.user.id]);
      const profiles = await db.getAll('SELECT * FROM profiles WHERE id = ?', [user.user.id]);

      expect(containers.length).toBeGreaterThan(0);
      expect(equipments.length).toBeGreaterThan(0);
      expect(memberships.length).toBeGreaterThan(0);
      expect(profiles.length).toBeGreaterThan(0);
    } finally {
      await cleanupDb(db, "test_member");
      db = null;
    }
  });

  it("User does not have data of (equipment/container/membership/profile) of an organization they are not a part of", async () => {
    const userA = await generateTestUser();
    const userB = await generateTestUser();

    // Org B owned by User B
    const orgB = await createOrganization(userB.token, "Org B");
    const containerB = await createContainer(userB.token, orgB.id, "Container B");
    const equipmentB = await createEquipment(userB.token, orgB.id, "Equipment B");

    db = await createPowerSyncClient(userA.token, getDbPath("test_non_member"));

    try {
      // Wait a bit to ensure nothing syncs
      await new Promise(resolve => setTimeout(resolve, 3000));

      const orgs = await db.getAll('SELECT * FROM organizations WHERE id = ?', [orgB.id]);
      const containers = await db.getAll('SELECT * FROM containers WHERE id = ?', [containerB.id]);
      const equipments = await db.getAll('SELECT * FROM equipment WHERE id = ?', [equipmentB.id]);
      // Profiles check: A should not see B if they have no shared orgs
      const profiles = await db.getAll('SELECT * FROM profiles WHERE id = ?', [userB.user.id]);

      expect(orgs.length).toBe(0);
      expect(containers.length).toBe(0);
      expect(equipments.length).toBe(0);
      expect(profiles.length).toBe(0);
    } finally {
      await cleanupDb(db, "test_non_member");
      db = null;
    }
  });

  it("User can join an org and gain new access", async () => {
    const userA = await generateTestUser();
    const userB = await generateTestUser();

    const orgA = await createOrganization(userA.token, "Org A");
    const containerA = await createContainer(userA.token, orgA.id, "Container A");

    db = await createPowerSyncClient(userB.token, getDbPath("test_join"));

    try {
      // Initially no access
      const resultsInitial = await db.getAll('SELECT * FROM organizations WHERE id = ?', [orgA.id]);
      expect(resultsInitial.length).toBe(0);

      // Join org
      await joinOrg(userB.token, orgA.id, userB.user.id);

      // Wait for sync
      await waitFor(async () => {
        const results = await db.getAll('SELECT * FROM organizations WHERE id = ?', [orgA.id]);
        return results.length > 0;
      });

      const containers = await db.getAll('SELECT * FROM containers WHERE id = ?', [containerA.id]);
      expect(containers.length).toBeGreaterThan(0);
    } finally {
      await cleanupDb(db, "test_join");
      db = null;
    }
  });

  it("User has access to data of multiple organizations they are a part of", async () => {
    const user = await generateTestUser();
    const org1 = await createOrganization(user.token, "Org 1");
    const org2 = await createOrganization(user.token, "Org 2");

    db = await createPowerSyncClient(user.token, getDbPath("test_multiple_orgs"));

    try {
      await waitFor(async () => {
        const results1 = await db.getAll('SELECT * FROM organizations WHERE id = ?', [org1.id]);
        const results2 = await db.getAll('SELECT * FROM organizations WHERE id = ?', [org2.id]);
        return results1.length > 0 && results2.length > 0;
      });

      expect(true).toBe(true); // If we reached here, both synced
    } finally {
      await cleanupDb(db, "test_multiple_orgs");
      db = null;
    }
  });

  it("User's membership is deleted and loses access to data", async () => {
    const userA = await generateTestUser();
    const userB = await generateTestUser();

    const orgA = await createOrganization(userA.token, "Org A");
    const containerA = await createContainer(userA.token, orgA.id, "Container A");

    await joinOrg(userB.token, orgA.id, userB.user.id);

    db = await createPowerSyncClient(userB.token, getDbPath("test_leave"));

    try {
      // Confirm access first
      await waitFor(async () => {
        const results = await db.getAll('SELECT * FROM organizations WHERE id = ?', [orgA.id]);
        return results.length > 0;
      });

      // Remove membership
      await removeMembership(userA.token, orgA.id, userB.user.id);

      // Wait for data to DISAPPEAR
      await waitFor(async () => {
        const results = await db.getAll('SELECT * FROM organizations WHERE id = ?', [orgA.id]);
        return results.length === 0;
      }, 20000); // Might take longer for PowerSync to process deletion sync

      const containers = await db.getAll('SELECT * FROM containers WHERE id = ?', [containerA.id]);
      expect(containers.length).toBe(0);
    } finally {
      await cleanupDb(db, "test_leave");
      db = null;
    }
  });
});
