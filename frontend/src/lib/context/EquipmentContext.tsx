import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { useQuery } from '@powersync/react-native';

import { useAuth } from './AuthContext';
import { useMembership } from './MembershipContext';
import { Container, Equipment, OrgOwnership, OrgMembership } from '../../types/models';
import { OrgMembershipRecord, ContainerRecord, EquipmentRecord } from '../../types/db';

interface EquipmentContextType {
    ownerships: Map<string, OrgOwnership>; // Key: membership.id, Value: OrgOwnership, Sorted by Name

    // Overlay state
    selectedEquipment: Equipment | null;
    setSelectedEquipment: (equipment: Equipment | null) => void;
    selectedContainer: Container | null;
    setSelectedContainer: (container: Container | null) => void;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const useEquipment = () => {
    const context = useContext(EquipmentContext);
    if (!context) {
        throw new Error('useEquipment must be used within an EquipmentProvider');
    }
    return context;
};

export const EquipmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { membership } = useMembership();
    const organizationId = membership?.organizationId;

    // Reactive queries
    const { data: rawMemberships } = useQuery<OrgMembershipRecord & { full_name?: string; user_profile?: string }>(
        `SELECT m.*, u.full_name, u.profile as user_profile
         FROM org_memberships m 
         LEFT JOIN users u ON m.user_id = u.id
         WHERE m.organization_id = ?`,
        [organizationId]
    );

    const { data: rawContainers } = useQuery<ContainerRecord>(
        'SELECT * FROM containers WHERE organization_id = ?',
        [organizationId]
    );

    const { data: rawEquipment } = useQuery<EquipmentRecord>(
        'SELECT * FROM equipment WHERE organization_id = ?',
        [organizationId]
    );

    // Overlay state
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);

    // Aggregate Data
    const ownerships = useMemo(() => {
        if (!user || !membership || !organizationId) {
            return new Map<string, OrgOwnership>();
        }

        const tempMap = new Map<string, OrgOwnership>();
        const containerMap = new Map<string, Container>();

        // 1. Initialize all memberships as ownership roots
        rawMemberships.forEach(m => {
            tempMap.set(m.id, {
                membership: new OrgMembership(m, m.full_name, m.user_profile),
                items: []
            });
        });

        // 2. Create Container instances and assign to owners
        rawContainers.forEach(c => {
            const containerInstance = new Container(c);
            containerMap.set(c.id, containerInstance);

            const ownerId = c.assigned_to;
            if (tempMap.has(ownerId)) {
                tempMap.get(ownerId)!.items.push(containerInstance);
            }
        });

        // Help with grouping
        const topLevelEquipmentMap = new Map<string, Equipment>(); // Key: ownerId + name
        const containerEquipmentMap = new Map<string, Map<string, Equipment>>(); // Key: containerId -> (name -> Equipment)

        // 3. Create Equipment instances and assign to Containers or Owners (with grouping)
        rawEquipment.forEach(e => {
            if (e.container_id && containerMap.has(e.container_id)) {
                // Grouped inside a container
                const cId = e.container_id;
                if (!containerEquipmentMap.has(cId)) {
                    containerEquipmentMap.set(cId, new Map());
                }
                const cMap = containerEquipmentMap.get(cId)!;
                if (cMap.has(e.name)) {
                    cMap.get(e.name)!.addRecord(e);
                } else {
                    const equipmentInstance = new Equipment(e);
                    cMap.set(e.name, equipmentInstance);
                    containerMap.get(cId)!.equipment.push(equipmentInstance);
                }
            } else {
                // Top-level item grouping
                const ownerId = e.assigned_to;
                const groupKey = `${ownerId}_${e.name}`;
                if (topLevelEquipmentMap.has(groupKey)) {
                    topLevelEquipmentMap.get(groupKey)!.addRecord(e);
                } else {
                    const equipmentInstance = new Equipment(e);
                    topLevelEquipmentMap.set(groupKey, equipmentInstance);
                    if (tempMap.has(ownerId)) {
                        tempMap.get(ownerId)!.items.push(equipmentInstance);
                    }
                }
            }
        });

        // 4. Sort alphabetically and Build Final Map
        const sortedRoots = Array.from(tempMap.values()).sort((a, b) => {
            return a.membership.name.localeCompare(b.membership.name);
        });

        const finalMap = new Map<string, OrgOwnership>();
        sortedRoots.forEach(root => {
            // Also sort items within each ownership
            root.items.sort((a, b) => a.name.localeCompare(b.name));
            finalMap.set(root.membership.id, root);
        });

        return finalMap;
    }, [user, membership, organizationId, rawMemberships, rawContainers, rawEquipment]);

    const contextValue: EquipmentContextType = {
        ownerships,
        selectedEquipment,
        setSelectedEquipment,
        selectedContainer,
        setSelectedContainer,
    };

    return (
        <EquipmentContext.Provider value={contextValue}>
            {children}
        </EquipmentContext.Provider>
    );
};
