import { OrgMembershipRecord, ContainerRecord, EquipmentRecord } from "./db";

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
}

export class Equipment {
    readonly type = 'equipment';
    records: EquipmentRecord[];
    selectedRecordIndex: number = 0;

    constructor(record: EquipmentRecord) {
        this.records = [record];
    }

    addRecord(record: EquipmentRecord) {
        this.records.push(record);
    }

    get selectedRecord() {
        return this.records[this.selectedRecordIndex] || this.records[0];
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
}
