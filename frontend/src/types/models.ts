import { OrgMembershipRecord, ContainerRecord, EquipmentRecord } from "./db";
import { AbstractPowerSyncDatabase } from "@powersync/react-native";

export type Item = Equipment | Container;

export interface OrgOwnership {
    membership: OrgMembershipRecord;
    items: Item[];
}

export class Container {
    readonly type = 'container';
    container: ContainerRecord;
    equipment: Equipment[];

    constructor(container: ContainerRecord) {
        this.container = container;
        this.equipment = [];
    }

    get id() { return this.container.id; }
    get name() { return this.container.name; }
    get color() { return this.container.color; }
    get organizationId() { return this.container.organization_id; }

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
            await tx.execute(
                'UPDATE containers SET assigned_to = ?, last_updated_date = ? WHERE id = ?',
                [targetMemberId, now, this.id]
            );

            // Update all equipment in container
            await tx.execute(
                'UPDATE equipment SET assigned_to = ?, last_updated_date = ? WHERE container_id = ?',
                [targetMemberId, now, this.id]
            );
        });
    }
}

export class Equipment {
    readonly type = 'equipment';
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

    get count() { return this.records.length; }
    get id() { return this.selectedRecord.id; }
    get name() { return this.selectedRecord.name; }
    get color() { return this.selectedRecord.color; }
    get image() { return this.selectedRecord.image; }
    get organizationId() { return this.selectedRecord.organization_id; }

    getEquipment() {
        return this.selectedRecord;
    }

    inContainer() {
        return this.selectedRecord.container_id !== null;
    }

    async reassign(db: AbstractPowerSyncDatabase, targetMemberId: string, targetContainerId: string | null = null) {
        const now = new Date().toISOString();
        const selectedRecords = Array.from(this.selectedIndices).map(i => this.records[i]);

        await db.writeTransaction(async (tx) => {
            for (const record of selectedRecords) {
                await tx.execute(
                    'UPDATE equipment SET assigned_to = ?, container_id = ?, last_updated_date = ? WHERE id = ?',
                    [targetMemberId, targetContainerId, now, record.id]
                );
            }
        });
    }
}
