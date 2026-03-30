import { useRef } from "react";
import { useQuery } from "@powersync/react-native";
import { Container, Equipment, OrgMembership } from "../../types/models";
import { OrgOwnership } from "../../types/other";
import {
  OrgMembershipRecord,
  ContainerRecord,
  EquipmentRecord,
} from "../../types/db";
import { Queries } from "../powersync/queries";

export function useEquipmentData(
  userId: string | undefined,
  membership: any,
  organizationId: string | undefined,
) {
  // Reactive queries
  const { data: rawMemberships } = useQuery<
    OrgMembershipRecord & {
      name?: string;
      user_profile?: string;
      user_color?: string;
    }
  >(Queries.Membership.getAllByOrg, [organizationId], {
    tables: ["org_memberships", "profiles"],
  });

  const { data: rawContainers } = useQuery<ContainerRecord>(
    Queries.Container.getAllByOrg,
    [organizationId],
    { tables: ["containers"] },
  );

  const { data: rawEquipment } = useQuery<EquipmentRecord>(
    Queries.Equipment.getAllByOrg,
    [organizationId],
    { tables: ["equipment"] },
  );

  // 1. Process Memberships
  const membershipMap = new Map<string, OrgOwnership>();
  if (rawMemberships) {
    rawMemberships.forEach((m) => {
      membershipMap.set(m.id, {
        membership: new OrgMembership(m, m.name, m.user_profile, m.user_color),
        items: [],
      });
    });
  }

  // Selection Cache to persist selection state across data refreshes
  const selectionCache = useRef(new Map<string, Set<number>>());
  const getSelectionState = (id: string) => {
    if (!selectionCache.current.has(id)) {
      selectionCache.current.set(id, new Set([0]));
    }
    return selectionCache.current.get(id);
  };

  // 2. Process Containers and Equipment together
  const containerMap = new Map<string, Container>();
  const assignedContainers: { container: Container; ownerId: string }[] = [];
  const topLevelEquipmentMap = new Map<string, Equipment>();
  const directAssignments: { equipment: Equipment; ownerId: string }[] = [];

  // Initialize Containers
  if (rawContainers) {
    rawContainers.forEach((c) => {
      const containerInstance = new Container(c);
      containerMap.set(c.id, containerInstance);
      assignedContainers.push({
        container: containerInstance,
        ownerId: c.assigned_to,
      });
    });
  }

  // Group Equipment into Containers or Direct Assignments
  if (rawEquipment) {
    rawEquipment.forEach((record) => {
      // Get persistent selection set for this equipment ID
      const selectionSet = getSelectionState(record.name); // Using Name as key for the Group since they are grouped by name

      if (record.container_id && containerMap.has(record.container_id)) {
        // Inside a container
        const container = containerMap.get(record.container_id)!;
        const existingGroup = container.equipment.find(
          (e) => e.name === record.name,
        );

        if (existingGroup) {
          existingGroup.addRecord(record);
        } else {
          // Pass the cached selection set
          const equipmentInstance = new Equipment(record, selectionSet);
          container.equipment.push(equipmentInstance);
        }
      } else {
        // Direct assignment to user
        const ownerId = record.assigned_to;
        const groupKey = `${ownerId}_${record.name}`;

        if (topLevelEquipmentMap.has(groupKey)) {
          topLevelEquipmentMap.get(groupKey)!.addRecord(record);
        } else {
          // Pass the cached selection set
          const equipmentInstance = new Equipment(record, selectionSet);
          topLevelEquipmentMap.set(groupKey, equipmentInstance);
          directAssignments.push({ equipment: equipmentInstance, ownerId });
        }
      }
    });
  }

  // 3. Combine into final Ownerships Map
  if (!userId || !membership || !organizationId) {
    return new Map<string, OrgOwnership>();
  }

  const tempMap = new Map<string, OrgOwnership>();

  membershipMap.forEach((val, key) => {
    tempMap.set(key, {
      membership: val.membership,
      items: [],
    });
  });

  // Add Containers
  assignedContainers.forEach(({ container, ownerId }) => {
    if (tempMap.has(ownerId)) {
      tempMap.get(ownerId)!.items.push(container);
    }
  });

  // Add Direct Equipment
  directAssignments.forEach(({ equipment, ownerId }) => {
    if (tempMap.has(ownerId)) {
      tempMap.get(ownerId)!.items.push(equipment);
    }
  });

  // Sort by equipment presence, then alphabetically
  const sortedRoots = Array.from(tempMap.values()).sort((a, b) => {
    const aHasItems = a.items.length > 0 ? 1 : 0;
    const bHasItems = b.items.length > 0 ? 1 : 0;

    if (aHasItems !== bHasItems) {
      return bHasItems - aHasItems; // Prioritize members with items
    }

    return a.membership.name.localeCompare(b.membership.name);
  });

  const finalMap = new Map<string, OrgOwnership>();
  sortedRoots.forEach((root) => {
    root.items.sort((a, b) => a.name.localeCompare(b.name));
    finalMap.set(root.membership.id, root);
  });

  return finalMap;
}
