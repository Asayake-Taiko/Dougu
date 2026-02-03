import {
  OrgMembershipRecord,
  ContainerRecord,
  EquipmentRecord,
  OrganizationRecord,
  ProfileRecord,
} from "./db";
import { AbstractPowerSyncDatabase } from "@powersync/react-native";
import { Queries } from "../lib/powersync/queries";
import { equipmentService } from "../lib/services/equipment";
import { organizationService } from "../lib/services/organization";

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
    await equipmentService.reassignContainer(db, this, targetMemberId);
  }

  async delete() {
    await equipmentService.deleteContainer(this);
  }
}

export class Equipment {
  readonly type = "equipment";
  records: EquipmentRecord[];
  selectedIndices: Set<number>;

  constructor(record: EquipmentRecord, selectedIndices?: Set<number>) {
    this.records = [record];
    this.selectedIndices = selectedIndices || new Set([0]);
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
    await equipmentService.reassignEquipment(
      db,
      this,
      targetMemberId,
      targetContainerId,
    );
  }

  async delete() {
    await equipmentService.deleteEquipment(this);
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

  async updateImage(newImage: string) {
    await organizationService.updateOrganizationImage(this.id, newImage);
  }

  async delete() {
    await organizationService.deleteOrganization(this.id);
  }

  async transferOwnership(newManagerId: string) {
    await organizationService.transferOwnership(this.id, newManagerId);
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
    return this.userProfile || this.membership.profile_image;
  }
  get details() {
    return this.membership.details;
  }

  async delete() {
    await organizationService.deleteMembership(this.organizationId, this.id);
  }
}

export class Profile {
  readonly type = "profile";
  private data: ProfileRecord;

  constructor(data: ProfileRecord) {
    this.data = data;
  }

  get id() {
    return this.data.id;
  }
  get name() {
    return this.data.name;
  }
  get profileImage() {
    return this.data.profile_image;
  }

  getRecord() {
    return this.data;
  }

  async updateName(db: AbstractPowerSyncDatabase, newName: string) {
    const now = new Date().toISOString();
    await db.execute(Queries.Profile.updateName, [newName, now, this.id]);
    this.data.name = newName;
    this.data.updated_at = now;
  }

  async updateProfileImage(
    db: AbstractPowerSyncDatabase,
    newProfileImage: string,
  ) {
    const now = new Date().toISOString();
    await db.execute(Queries.Profile.updateProfile, [
      newProfileImage,
      now,
      this.id,
    ]);
    this.data.profile_image = newProfileImage;
    this.data.updated_at = now;
  }
}
