import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { db } from '../powersync/PowerSync';
import { useAuth } from './AuthContext';
import { OrgMembershipRecord, OrganizationRecord } from '../../types/db';
import { Organization, OrgMembership } from '../../types/models';
import { Logger } from '../Logger';

interface MembershipContextType {
    organization: Organization | null;
    members: OrgMembership[];
    membershipId: string | null;
    isResolving: boolean;
    isManager: boolean;
    switchOrganization: (orgId: string, orgName: string) => Promise<void>;
}

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

export const useMembership = () => {
    const context = useContext(MembershipContext);
    if (!context) {
        throw new Error('useMembership must be used within a MembershipProvider');
    }
    return context;
};

const STORAGE_KEYS = {
    ORG_ID: 'lastSelection_orgId',
    ORG_NAME: 'lastSelection_orgName',
};

export const MembershipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [organizationId, setOrganizationId] = useState<string | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [members, setMembers] = useState<OrgMembership[]>([]);
    const [membershipId, setMembershipId] = useState<string | null>(null);
    const [isResolving, setIsResolving] = useState(true);

    // Initial load from SecureStore
    useEffect(() => {
        async function loadPersistedOrg() {
            try {
                const id = await SecureStore.getItemAsync(STORAGE_KEYS.ORG_ID);
                if (id) {
                    setOrganizationId(id);
                } else {
                    setIsResolving(false);
                }
            } catch (e) {
                Logger.error("Failed to load persisted org", e);
                setIsResolving(false);
            }
        }
        loadPersistedOrg();
    }, []);

    // Resolve membership whenever organizationId or user changes
    useEffect(() => {
        async function resolveSession() {
            if (!user) {
                setMembershipId(null);
                setOrganization(null);
                setIsResolving(false);
                return;
            }

            if (organizationId) {
                try {
                    // Fetch Membership
                    const membershipResult = await db.getOptional<OrgMembershipRecord>(
                        'SELECT id FROM org_memberships WHERE organization_id = ? AND user_id = ?',
                        [organizationId, user.id]
                    );

                    if (membershipResult) {
                        setMembershipId(membershipResult.id);

                        // Fetch Organization record
                        const orgResult = await db.getOptional<OrganizationRecord>(
                            'SELECT * FROM organizations WHERE id = ?',
                            [organizationId]
                        );

                        if (orgResult) {
                            setOrganization(new Organization(orgResult));
                        } else {
                            setOrganization(null);
                        }

                        // Fetch all memberships in this organization with user names
                        const membersResult = await db.getAll<OrgMembershipRecord & { full_name?: string }>(
                            `SELECT m.*, u.full_name 
                             FROM org_memberships m 
                             LEFT JOIN users u ON m.user_id = u.id 
                             WHERE m.organization_id = ?`,
                            [organizationId]
                        );

                        const memberModels = membersResult
                            .map(m => new OrgMembership(m, m.full_name))
                            .sort((a, b) => a.name.localeCompare(b.name));

                        setMembers(memberModels);
                    } else {
                        // Stale org or user switched to one they aren't in
                        setMembershipId(null);
                        setOrganization(null);
                        setMembers([]);

                        // Clear storage
                        await SecureStore.deleteItemAsync(STORAGE_KEYS.ORG_ID);
                        await SecureStore.deleteItemAsync(STORAGE_KEYS.ORG_NAME);
                    }
                } catch (e) {
                    Logger.error("Error resolving membership/org", e);
                    setMembershipId(null);
                    setOrganization(null);
                }
            } else {
                setMembershipId(null);
                setOrganization(null);
                setMembers([]);
            }
            setIsResolving(false);
        }
        resolveSession();
    }, [organizationId, user]);

    const switchOrganization = async (orgId: string, orgName: string) => {
        setIsResolving(true);
        setOrganizationId(orgId);

        try {
            await SecureStore.setItemAsync(STORAGE_KEYS.ORG_ID, orgId);
            await SecureStore.setItemAsync(STORAGE_KEYS.ORG_NAME, orgName);
        } catch (e) {
            Logger.error("Failed to persist organization selection", e);
        }
    };

    const value: MembershipContextType = {
        organization,
        members,
        membershipId,
        isResolving,
        isManager: organization?.managerId === user?.id,
        switchOrganization,
    };

    return (
        <MembershipContext.Provider value={value}>
            {children}
        </MembershipContext.Provider>
    );
};
