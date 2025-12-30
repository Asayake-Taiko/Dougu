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
    equipment: EquipmentRecord;

    constructor(equipment: EquipmentRecord) {
        this.equipment = equipment;
    }

    get id() { return this.equipment.id; }
    get name() { return this.equipment.name; }
    get color() { return this.equipment.color; }
    get image() { return this.equipment.image; }
    get organizationId() { return this.equipment.organization_id; }

    getEquipment() {
        return this.equipment;
    }

    inContainer() {
        return this.equipment.container_id !== null;
    }
}
