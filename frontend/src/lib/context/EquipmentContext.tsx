import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { db } from '../powersync/PowerSync';
import { useAuth } from './AuthContext';
import { Logger } from '../Logger';
import { useMembership } from './MembershipContext';
import { Container, Equipment, OrgOwnership, OrgMembership } from '../../types/models';
import { OrgMembershipRecord, ContainerRecord, EquipmentRecord } from '../../types/db';

interface EquipmentContextType {
    ownerships: Map<string, OrgOwnership>; // Key: membership.id, Value: OrgOwnership, Sorted by Name
    refresh: () => Promise<void>;

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
    const [ownerships, setOwnerships] = useState<Map<string, OrgOwnership>>(new Map());

    // Overlay state
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);


    const refresh = async () => {
        try {
            if (!user || !membership) {
                setOwnerships(new Map());
                return;
            }

            const organizationId = membership.organizationId;

            // 2. Fetch all Memberships, Containers, and Equipment for this Org
            // JOIN with users to get full_name for sorting USER type memberships
            const membershipsWithNames = await db.getAll<OrgMembershipRecord & { full_name?: string; user_profile?: string }>(`
                SELECT m.*, u.full_name, u.profile as user_profile
                FROM org_memberships m 
                LEFT JOIN users u ON m.user_id = u.id
                WHERE m.organization_id = ?
            `, [organizationId]);

            const containers = await db.getAll<ContainerRecord>(
                'SELECT * FROM containers WHERE organization_id = ?',
                [organizationId]
            );

            const equipment = await db.getAll<EquipmentRecord>(
                'SELECT * FROM equipment WHERE organization_id = ?',
                [organizationId]
            );

            // 3. Aggregate Data
            const tempMap = new Map<string, OrgOwnership>();
            const containerMap = new Map<string, Container>();

            // Initialize all memberships as ownership roots
            membershipsWithNames.forEach(m => {
                tempMap.set(m.id, {
                    membership: new OrgMembership(m, m.full_name, m.user_profile),
                    items: []
                });
            });

            // Create Container instances and assign to owners
            containers.forEach(c => {
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

            // Create Equipment instances and assign to Containers or Owners (with grouping)
            equipment.forEach(e => {
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
            const sortedItems = Array.from(tempMap.values()).sort((a, b) => {
                return a.membership.name.localeCompare(b.membership.name);
            });

            // Insert into a new Map in sorted order
            const finalMap = new Map<string, OrgOwnership>();
            sortedItems.forEach(item => {
                // Also sort items within each ownership
                item.items.sort((a, b) => a.name.localeCompare(b.name));
                finalMap.set(item.membership.id, item);
            });

            setOwnerships(finalMap);

        } catch (error) {
            Logger.error('Error refreshing equipment context', error);
        }
    };

    useEffect(() => {
        refresh();
    }, [membership, user]);

    const contextValue: EquipmentContextType = {
        ownerships,
        refresh,
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
