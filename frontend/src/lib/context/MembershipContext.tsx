import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useQuery } from '@powersync/react-native';
import { db } from '../powersync/PowerSync';
import { useAuth } from './AuthContext';
import { OrgMembershipRecord, OrganizationRecord } from '../../types/db';
import { Organization, OrgMembership } from '../../types/models';
import { Logger } from '../Logger';

interface MembershipContextType {
    organization: Organization | null;
    membership: OrgMembership | null;
    isResolving: boolean;
    isManager: boolean;
    switchOrganization: (orgId: string, orgName: string) => Promise<void>;
    createOrganization: (name: string) => Promise<{ id: string; name: string; code: string }>;
    joinOrganization: (code: string) => Promise<{ id: string; name: string }>;
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
    const [loadingPersistedOrg, setLoadingPersistedOrg] = useState(true);

    // Initial load from SecureStore
    useEffect(() => {
        async function loadPersistedOrg() {
            try {
                const id = await SecureStore.getItemAsync(STORAGE_KEYS.ORG_ID);
                if (id) {
                    setOrganizationId(id);
                }
            } catch (e) {
                Logger.error("Failed to load persisted org", e);
            } finally {
                setLoadingPersistedOrg(false);
            }
        }
        loadPersistedOrg();
    }, []);

    // Reactive queries
    const { data: membershipData, isLoading: loadingMembership } = useQuery<OrgMembershipRecord & { full_name?: string; user_profile?: string }>(
        `SELECT m.*, u.full_name, u.profile as user_profile
         FROM org_memberships m 
         LEFT JOIN users u ON m.user_id = u.id 
         WHERE m.organization_id = ? AND m.user_id = ?`,
        [organizationId, user?.id]
    );

    const { data: orgData, isLoading: loadingOrg } = useQuery<OrganizationRecord>(
        'SELECT * FROM organizations WHERE id = ?',
        [organizationId]
    );

    // Derive models and state
    const membership = useMemo(() => {
        const data = membershipData[0];
        return data ? new OrgMembership(data, data.full_name, data.user_profile) : null;
    }, [membershipData]);

    const organization = useMemo(() =>
        orgData[0] ? new Organization(orgData[0]) : null
        , [orgData]);

    const isResolving = loadingPersistedOrg || (!!organizationId && (loadingMembership || loadingOrg));

    // Cleanup stale organization selection
    useEffect(() => {
        if (!isResolving && !organization) {
            async function clearStaleOrg() {
                Logger.warn("User is no longer a member of the selected organization. Clearing selection.");
                setOrganizationId(null);
                try {
                    await SecureStore.deleteItemAsync(STORAGE_KEYS.ORG_ID);
                    await SecureStore.deleteItemAsync(STORAGE_KEYS.ORG_NAME);
                } catch (e) {
                    Logger.error("Failed to clear stale org from SecureStore", e);
                }
            }
            clearStaleOrg();
        }
    }, [isResolving, organization]);

    const switchOrganization = async (orgId: string, orgName: string) => {
        setOrganizationId(orgId);
        await SecureStore.setItemAsync(STORAGE_KEYS.ORG_ID, orgId);
        await SecureStore.setItemAsync(STORAGE_KEYS.ORG_NAME, orgName);
    };

    const generateRandomString = (length: number) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const generateUniqueCode = async (): Promise<string> => {
        while (true) {
            const code = generateRandomString(7);
            const existing = await db.getOptional<{ id: string }>('SELECT id FROM organizations WHERE access_code = ?', [code]);
            if (!existing) return code;
        }
    };

    const createOrganization = async (name: string) => {
        if (!name.trim()) throw new Error("Please enter an organization name.");
        const nameRegEx = /^[a-zA-Z0-9-_]{1,40}$/;
        if (!nameRegEx.test(name)) throw new Error("Invalid name! Use 1-40 alphanumeric characters, no spaces (_ and - allowed).");

        const existingOrg = await db.getOptional<{ id: string }>('SELECT id FROM organizations WHERE name = ?', [name]);
        if (existingOrg) throw new Error("Organization name is already taken!");

        const code = await generateUniqueCode();
        const orgId = Math.random().toString(36).substring(2, 15);
        const membershipId = Math.random().toString(36).substring(2, 15);

        await db.writeTransaction(async (tx) => {
            await tx.execute(
                'INSERT INTO organizations (id, name, access_code, manager_id, created_at) VALUES (?, ?, ?, ?, ?)',
                [orgId, name, code, user?.id, new Date().toISOString()]
            );
            await tx.execute(
                'INSERT INTO org_memberships (id, organization_id, user_id, type) VALUES (?, ?, ?, ?)',
                [membershipId, orgId, user?.id, 'USER']
            );
        });

        await switchOrganization(orgId, name);
        return { id: orgId, name, code };
    };

    const joinOrganization = async (code: string) => {
        const trimmedCode = code.trim().toUpperCase();
        if (!trimmedCode) throw new Error("Please enter an access code");

        const org = await db.getOptional<OrganizationRecord>('SELECT * FROM organizations WHERE access_code = ?', [trimmedCode]);
        if (!org) throw new Error("Organization not found");

        const existingMemberships = await db.getAll(
            'SELECT * FROM org_memberships WHERE organization_id = ? AND user_id = ?',
            [org.id, user?.id]
        );
        if (existingMemberships.length > 0) throw new Error("You are already a member of this organization.");

        const membershipId = Math.random().toString(36).substring(2, 15);
        await db.execute(
            'INSERT INTO org_memberships (id, organization_id, user_id, type) VALUES (?, ?, ?, ?)',
            [membershipId, org.id, user?.id, 'USER']
        );

        await switchOrganization(org.id, org.name);
        return { id: org.id, name: org.name };
    };

    const value: MembershipContextType = {
        organization,
        membership,
        isResolving,
        isManager: organization?.managerId === user?.id,
        switchOrganization,
        createOrganization,
        joinOrganization,
    };

    return (
        <MembershipContext.Provider value={value}>
            {children}
        </MembershipContext.Provider>
    );
};
