import { useMemo } from 'react';
import { useQuery } from '@powersync/react-native';
import { User } from '../../types/models';
import { Container, Equipment, OrgOwnership, OrgMembership } from '../../types/models';
import { OrgMembershipRecord, ContainerRecord, EquipmentRecord } from '../../types/db';
import { Queries } from '../powersync/queries';

export function useEquipmentData(user: User | null, membership: any, organizationId: string | undefined) {
    // Reactive queries
    const { data: rawMemberships } = useQuery<OrgMembershipRecord & { full_name?: string; user_profile?: string }>(
        Queries.Membership.getAllByOrg,
        [organizationId]
    );

    const { data: rawContainers } = useQuery<ContainerRecord>(
        Queries.Container.getAllByOrg,
        [organizationId]
    );

    const { data: rawEquipment } = useQuery<EquipmentRecord>(
        Queries.Equipment.getAllByOrg,
        [organizationId]
    );

    // 1. Process Memberships
    const membershipMap = useMemo(() => {
        const map = new Map<string, OrgOwnership>();
        rawMemberships.forEach(m => {
            map.set(m.id, {
                membership: new OrgMembership(m, m.full_name, m.user_profile),
                items: []
            });
        });
        return map;
    }, [rawMemberships]);

    // 2. Process Containers and Equipment together
    const { assignedContainers, directAssignments } = useMemo(() => {
        const containerMap = new Map<string, Container>();
        const assigned: { container: Container; ownerId: string }[] = [];
        const topLevelEquipmentMap = new Map<string, Equipment>();
        const direct: { equipment: Equipment; ownerId: string }[] = [];

        // Initialize Containers
        rawContainers.forEach(c => {
            const containerInstance = new Container(c);
            containerMap.set(c.id, containerInstance);
            assigned.push({ container: containerInstance, ownerId: c.assigned_to });
        });

        // Group Equipment into Containers or Direct Assignments
        rawEquipment.forEach(record => {
            if (record.container_id && containerMap.has(record.container_id)) {
                // Inside a container
                const container = containerMap.get(record.container_id)!;
                const existingGroup = container.equipment.find(e => e.name === record.name);

                if (existingGroup) {
                    existingGroup.addRecord(record);
                } else {
                    const equipmentInstance = new Equipment(record);
                    container.equipment.push(equipmentInstance);
                }
            } else {
                // Direct assignment to user
                const ownerId = record.assigned_to;
                const groupKey = `${ownerId}_${record.name}`;

                if (topLevelEquipmentMap.has(groupKey)) {
                    topLevelEquipmentMap.get(groupKey)!.addRecord(record);
                } else {
                    const equipmentInstance = new Equipment(record);
                    topLevelEquipmentMap.set(groupKey, equipmentInstance);
                    direct.push({ equipment: equipmentInstance, ownerId });
                }
            }
        });

        return { assignedContainers: assigned, directAssignments: direct };
    }, [rawContainers, rawEquipment]);


    // 3. Combine into final Ownerships Map
    const ownerships = useMemo(() => {
        if (!user || !membership || !organizationId) {
            return new Map<string, OrgOwnership>();
        }

        const tempMap = new Map<string, OrgOwnership>();

        membershipMap.forEach((val, key) => {
            tempMap.set(key, {
                membership: val.membership,
                items: []
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

        // Sort alphabetically
        const sortedRoots = Array.from(tempMap.values()).sort((a, b) => {
            return a.membership.name.localeCompare(b.membership.name);
        });

        const finalMap = new Map<string, OrgOwnership>();
        sortedRoots.forEach(root => {
            root.items.sort((a, b) => a.name.localeCompare(b.name));
            finalMap.set(root.membership.id, root);
        });

        return finalMap;

    }, [user, membership, organizationId, membershipMap, assignedContainers, directAssignments]);

    return ownerships;
}
