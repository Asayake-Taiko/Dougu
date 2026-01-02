import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { db } from '../powersync/PowerSync';
import { useAuth } from './AuthContext';
import { OrgMembershipRecord } from '../../types/db';
import { Logger } from '../Logger';

interface MembershipContextType {
    organizationId: string | null;
    organizationName: string | null;
    membershipId: string | null;
    isResolving: boolean;
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
    const [organizationName, setOrganizationName] = useState<string | null>(null);
    const [membershipId, setMembershipId] = useState<string | null>(null);
    const [isResolving, setIsResolving] = useState(true);

    // Initial load from SecureStore
    useEffect(() => {
        async function loadPersistedOrg() {
            try {
                const id = await SecureStore.getItemAsync(STORAGE_KEYS.ORG_ID);
                const name = await SecureStore.getItemAsync(STORAGE_KEYS.ORG_NAME);
                if (id && name) {
                    setOrganizationId(id);
                    setOrganizationName(name);
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
        async function resolveMembership() {
            if (!user) {
                setMembershipId(null);
                setIsResolving(false);
                return;
            }

            if (organizationId) {
                try {
                    const result = await db.getOptional<OrgMembershipRecord>(
                        'SELECT id FROM org_memberships WHERE organization_id = ? AND user_id = ?',
                        [organizationId, user.id]
                    );

                    if (result) {
                        setMembershipId(result.id);
                    } else {
                        // Stale org or user switched to one they aren't in
                        setMembershipId(null);
                        setOrganizationId(null);
                        setOrganizationName(null);

                        // Clear storage
                        await SecureStore.deleteItemAsync(STORAGE_KEYS.ORG_ID);
                        await SecureStore.deleteItemAsync(STORAGE_KEYS.ORG_NAME);
                    }
                } catch (e) {
                    Logger.error("Error resolving membership", e);
                    setMembershipId(null);
                }
            } else {
                setMembershipId(null);
            }
            setIsResolving(false);
        }
        resolveMembership();
    }, [organizationId, user]);

    const switchOrganization = async (orgId: string, orgName: string) => {
        setIsResolving(true);
        setOrganizationId(orgId);
        setOrganizationName(orgName);

        try {
            await SecureStore.setItemAsync(STORAGE_KEYS.ORG_ID, orgId);
            await SecureStore.setItemAsync(STORAGE_KEYS.ORG_NAME, orgName);
        } catch (e) {
            Logger.error("Failed to persist organization selection", e);
        }
    };

    const value: MembershipContextType = {
        organizationId,
        organizationName,
        membershipId,
        isResolving,
        switchOrganization,
    };

    return (
        <MembershipContext.Provider value={value}>
            {children}
        </MembershipContext.Provider>
    );
};
