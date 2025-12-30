import { PowerSyncDatabase } from "@powersync/react-native";
import { UserRecord, OrgMembershipRecord, ContainerRecord, EquipmentRecord } from "./db";

export interface OrgOwnership {
    membership: OrgMembershipRecord;
    containers: ContainerRecord[];
    equipment: EquipmentRecord[]; // Equipment not in any container (assigned directly to member)
}