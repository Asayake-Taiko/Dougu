import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { db } from '../powersync/PowerSync';
import { useAuth } from './AuthContext';
import { Logger } from '../Logger';
import { Container, Equipment, OrgOwnership, Item } from '../../types/models';
import { OrgMembershipRecord, ContainerRecord, EquipmentRecord } from '../../types/db';

interface EquipmentContextType {
    currentMember: OrgMembershipRecord | null;
    ownerships: Map<string, OrgOwnership>; // Key: membership.id, Value: OrgOwnership, Sorted by Name
    refresh: () => Promise<void>;

    // Overlay state
    equipmentOverlayVisible: boolean;
    setEquipmentOverlayVisible: (visible: boolean) => void;
    containerOverlayVisible: boolean;
    setContainerOverlayVisible: (visible: boolean) => void;
    selectedEquipment: Equipment | null;
    setSelectedEquipment: (equipment: Equipment | null) => void;
    selectedContainer: Container | null;
    setSelectedContainer: (container: Container | null) => void;

    // Drag state
    draggingItem: Item | null;
    setDraggingItem: (item: Item | null) => void;

    // Shared logic
    containerPage: number;
    setContainerPage: (page: number) => void;
    dragValues: {
        x: SharedValue<number>;
        y: SharedValue<number>;
        scale: SharedValue<number>;
    };
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

    // Overlay state
    const [equipmentOverlayVisible, setEquipmentOverlayVisible] = useState(false);
    const [containerOverlayVisible, setContainerOverlayVisible] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);

    // Drag state
    const [draggingItem, setDraggingItem] = useState<Item | null>(null);

    // Shared logic
    const [containerPage, setContainerPage] = useState(0);
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const dragScale = useSharedValue(1);

    const refresh = async () => {
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

            // 2. Fetch all Memberships, Containers, and Equipment for this Org
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
    }, [membershipId, user]);

    const contextValue: EquipmentContextType = {
        currentMember,
        ownerships,
        refresh,
        equipmentOverlayVisible,
        setEquipmentOverlayVisible,
        containerOverlayVisible,
        setContainerOverlayVisible,
        selectedEquipment,
        setSelectedEquipment,
        selectedContainer,
        setSelectedContainer,
        draggingItem,
        setDraggingItem,

        // Shared logic
        containerPage,
        setContainerPage,
        dragValues: {
            x: dragX,
            y: dragY,
            scale: dragScale,
        },
    };

    return (
        <EquipmentContext.Provider value={contextValue}>
            {children}
        </EquipmentContext.Provider>
    );
};
