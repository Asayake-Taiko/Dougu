import {
  OrgMembershipRecord,
  ContainerRecord,
  EquipmentRecord,
  OrganizationRecord,
  UserRecord,
} from "./db";
import { AbstractPowerSyncDatabase } from "@powersync/react-native";
import { Queries } from "../lib/powersync/queries";

export type Item = Equipment | Container;

export interface OrgOwnership {
  membership: OrgMembership;
  items: Item[];
}

export class Container {
  readonly type = "container";
  container: ContainerRecord;
  equipment: Equipment[];

  constructor(container: ContainerRecord) {
    this.container = container;
    this.equipment = [];
  }

  get id() {
    return this.container.id;
  }
  get name() {
    return this.container.name;
  }
  get color() {
    return this.container.color;
  }
  get organizationId() {
    return this.container.organization_id;
  }
  get count() {
    return 1;
  }

  getContainer() {
    return this.container;
  }

  getEquipment() {
    return this.equipment;
  }

  async reassign(db: AbstractPowerSyncDatabase, targetMemberId: string) {
    const now = new Date().toISOString();
    await db.writeTransaction(async (tx) => {
      // Update container
      await tx.execute(Queries.Container.updateAssignment, [
        targetMemberId,
        now,
        this.id,
      ]);

      // Update all equipment in container
      await tx.execute(Queries.Equipment.updateAssignmentByContainer, [
        targetMemberId,
        now,
        this.id,
      ]);
    });
  }

  async delete(db: AbstractPowerSyncDatabase) {
    await db.writeTransaction(async (tx) => {
      // Delete all equipment in container
      await tx.execute(Queries.Container.deleteEquipmentIn, [this.id]);
      // Delete container
      await tx.execute(Queries.Container.delete, [this.id]);
    });
  }
}

export class Equipment {
  readonly type = "equipment";
  records: EquipmentRecord[];
  selectedIndices: Set<number> = new Set([0]); // Default to first item

  constructor(record: EquipmentRecord) {
    this.records = [record];
  }

  addRecord(record: EquipmentRecord) {
    this.records.push(record);
  }

  get selectedRecord() {
    // Return first selected record for backward compatibility
    const firstIndex = Array.from(this.selectedIndices)[0] ?? 0;
    return this.records[firstIndex] || this.records[0];
  }

  get firstUnselectedRecord() {
    for (let i = 0; i < this.records.length; i++) {
      if (!this.selectedIndices.has(i)) {
        return this.records[i];
      }
    }
    return this.records[0];
  }

  get selectedCount() {
    return this.selectedIndices.size;
  }

  toggleSelection(index: number) {
    if (index < 0 || index >= this.records.length) return;

    if (this.selectedIndices.has(index)) {
      this.selectedIndices.delete(index);
      // Ensure at least one is always selected
      if (this.selectedIndices.size === 0) {
        this.selectedIndices.add(0);
      }
    } else {
      this.selectedIndices.add(index);
    }
  }

  selectAll() {
    this.selectedIndices.clear();
    for (let i = 0; i < this.records.length; i++) {
      this.selectedIndices.add(i);
    }
  }

  clearSelection() {
    this.selectedIndices.clear();
    this.selectedIndices.add(0); // Default to first
  }

  get count() {
    return this.records.length;
  }
  get id() {
    return this.selectedRecord.id;
  }
  get name() {
    return this.selectedRecord.name;
  }
  get color() {
    return this.selectedRecord.color;
  }
  get image() {
    return this.selectedRecord.image;
  }
  get organizationId() {
    return this.selectedRecord.organization_id;
  }

  getEquipment() {
    return this.selectedRecord;
  }

  inContainer() {
    return this.selectedRecord.container_id !== null;
  }

  async reassign(
    db: AbstractPowerSyncDatabase,
    targetMemberId: string,
    targetContainerId: string | null = null,
  ) {
    const now = new Date().toISOString();
    const selectedRecords = Array.from(this.selectedIndices).map(
      (i) => this.records[i],
    );

    await db.writeTransaction(async (tx) => {
      for (const record of selectedRecords) {
        await tx.execute(Queries.Equipment.updateAssignment, [
          targetMemberId,
          targetContainerId,
          now,
          record.id,
        ]);
      }
    });
  }

  async delete(db: AbstractPowerSyncDatabase) {
    await db.writeTransaction(async (tx) => {
      for (const record of this.records) {
        await tx.execute(Queries.Equipment.delete, [record.id]);
      }
    });
  }
}

export class Organization {
  readonly type = "organization";
  organization: OrganizationRecord;

  constructor(organization: OrganizationRecord) {
    this.organization = organization;
  }

  get id() {
    return this.organization.id;
  }
  get name() {
    return this.organization.name;
  }
  get accessCode() {
    return this.organization.access_code;
  }
  get managerId() {
    return this.organization.manager_id;
  }
  get image() {
    return this.organization.image;
  }

  async updateImage(db: AbstractPowerSyncDatabase, newImage: string) {
    await db.execute(Queries.Organization.updateImage, [newImage, this.id]);
    this.organization.image = newImage;
  }
}

export class OrgMembership {
  readonly type = "membership";
  membership: OrgMembershipRecord;
  userName?: string;
  userProfile?: string;

  constructor(
    membership: OrgMembershipRecord,
    userName?: string,
    userProfile?: string,
  ) {
    this.membership = membership;
    this.userName = userName;
    this.userProfile = userProfile;
  }

  get id() {
    return this.membership.id;
  }
  get organizationId() {
    return this.membership.organization_id;
  }
  get name() {
    if (this.membership.type === "STORAGE") {
      return this.membership.storage_name || "Unnamed Storage";
    }
    return this.userName || "Unknown User";
  }
  get membershipType() {
    return this.membership.type;
  }
  get userId() {
    return this.membership.user_id;
  }
  get profile() {
    return this.userProfile || this.membership.profile;
  }
  get details() {
    return this.membership.details;
  }
}

export class User {
  readonly type = "user";
  private data: UserRecord;

  constructor(data: UserRecord) {
    this.data = data;
  }

  get id() {
    return this.data.id;
  }
  get email() {
    return this.data.email;
  }
  get name() {
    return this.data.full_name;
  }
  get profile() {
    return this.data.profile;
  }

  getRecord() {
    return this.data;
  }

  async updateName(db: AbstractPowerSyncDatabase, newName: string) {
    const now = new Date().toISOString();
    await db.execute(Queries.User.updateName, [newName, now, this.id]);
    this.data.full_name = newName;
    this.data.updated_at = now;
  }

  async updateEmail(db: AbstractPowerSyncDatabase, newEmail: string) {
    const now = new Date().toISOString();
    await db.execute(Queries.User.updateEmail, [newEmail, now, this.id]);
    this.data.email = newEmail;
    this.data.updated_at = now;
  }

  async updateProfile(db: AbstractPowerSyncDatabase, newProfile: string) {
    const now = new Date().toISOString();
    await db.execute(Queries.User.updateProfile, [newProfile, now, this.id]);
    this.data.profile = newProfile;
    this.data.updated_at = now;
  }
}
