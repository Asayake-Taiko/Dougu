import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '../powersync/PowerSync';
import { useAuth } from './AuthContext';
import { Logger } from '../Logger';
import { Container, Equipment, OrgOwnership } from '../../types/models';
import { OrgMembershipRecord, ContainerRecord, EquipmentRecord } from '../../types/db';

interface EquipmentContextType {
    currentMember: OrgMembershipRecord | null;
    ownerships: Map<string, OrgOwnership>; // Key: membership.id, Value: OrgOwnership, Sorted by Name
    isLoading: boolean;
    refresh: () => Promise<void>;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const useEquipment = () => {
    const context = useContext(EquipmentContext);
    if (!context) {
        throw new Error('useEquipment must be used within an EquipmentProvider');
    }
    return context;
};

interface EquipmentProviderProps {
    children: ReactNode;
    membershipId: string;
}

export const EquipmentProvider: React.FC<EquipmentProviderProps> = ({ children, membershipId }) => {
    const { user } = useAuth();
    const [currentMember, setCurrentMember] = useState<OrgMembershipRecord | null>(null);
    const [ownerships, setOwnerships] = useState<Map<string, OrgOwnership>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    const refresh = async () => {
        setIsLoading(true);
        try {
            if (!user) {
                Logger.warn("EquipmentProvider: No user found.");
                return;
            }

            // 1. Resolve Membership and Organization
            const membershipResult = await db.getAll<OrgMembershipRecord>(
                'SELECT * FROM org_memberships WHERE id = ?',
                [membershipId]
            );

            if (membershipResult.length === 0) {
                Logger.error(`Membership not found: ${membershipId}`);
                setCurrentMember(null);
                setOwnerships(new Map());
                return;
            }

            const activeMember = membershipResult[0];
            const organizationId = activeMember.organization_id;
            setCurrentMember(activeMember);

            // 2. Fetch all Memberships (with names for sorting), Containers, and Equipment
            // JOIN with users to get full_name for sorting USER type memberships
            const membershipsWithNames = await db.getAll<OrgMembershipRecord & { full_name?: string }>(`
                SELECT m.*, u.full_name 
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
                    membership: m,
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

            // Create Equipment instances and assign to Containers or Owners
            equipment.forEach(e => {
                const equipmentInstance = new Equipment(e);

                if (e.container_id && containerMap.has(e.container_id)) {
                    // Nested in a container
                    containerMap.get(e.container_id)!.equipment.push(equipmentInstance);
                } else {
                    // Top-level item
                    const ownerId = e.assigned_to;
                    if (tempMap.has(ownerId)) {
                        tempMap.get(ownerId)!.items.push(equipmentInstance);
                    }
                }
            });

            // 4. Sort alphabetically and Build Final Map
            // Sorting Logic:
            // - If type is USER, use full_name (from JOIN)
            // - If type is STORAGE, use storage_name
            const sortedItems = Array.from(tempMap.values()).sort((a, b) => {
                // Determine name for A
                const memA = a.membership as (OrgMembershipRecord & { full_name?: string });
                const nameA = memA.type === 'USER'
                    ? (memA.full_name || 'Unknown')
                    : (memA.storage_name || 'Storage');

                // Determine name for B
                const memB = b.membership as (OrgMembershipRecord & { full_name?: string });
                const nameB = memB.type === 'USER'
                    ? (memB.full_name || 'Unknown')
                    : (memB.storage_name || 'Storage');

                return nameA.localeCompare(nameB);
            });

            // Insert into a new Map in sorted order
            const finalMap = new Map<string, OrgOwnership>();
            sortedItems.forEach(item => {
                finalMap.set(item.membership.id, item);
            });

            setOwnerships(finalMap);

        } catch (error) {
            Logger.error('Error refreshing equipment context', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [membershipId, user]);

    return (
        <EquipmentContext.Provider value={{ currentMember, ownerships, isLoading, refresh }}>
            {children}
        </EquipmentContext.Provider>
    );
};
