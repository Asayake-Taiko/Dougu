import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@powersync/react-native";

import { useAuth } from "./AuthContext";
import { OrgMembershipRecord, OrganizationRecord } from "../../types/db";
import { Organization, OrgMembership } from "../../types/models";
import { Logger } from "../utils/Logger";
import { Queries } from "../powersync/queries";

const STORAGE_KEYS = {
  ORG_ID: "lastSelection_orgId",
};

interface MembershipContextType {
  organization: Organization | null;
  membership: OrgMembership | null;
  isResolving: boolean;
  switchOrganization: (orgId: string) => Promise<void>;
  isManager: boolean;
}

const MembershipContext = createContext<MembershipContextType | undefined>(
  undefined,
);

export const useMembership = () => {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error("useMembership must be used within a MembershipProvider");
  }
  return context;
};

export const MembershipProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { session } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loadingPersistedOrg, setLoadingPersistedOrg] = useState(true);

  // Initial load from SecureStore
  useEffect(() => {
    async function loadPersistedOrg() {
      try {
        const id = await AsyncStorage.getItem(STORAGE_KEYS.ORG_ID);
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
  const { data: membershipData, isLoading: loadingMembership } = useQuery<
    OrgMembershipRecord & {
      name?: string;
      user_profile?: string;
      user_color?: string;
    }
  >(Queries.Membership.getDetailsByOrgAndUser, [
    organizationId,
    session?.user.id,
  ]);

  const { data: orgData, isLoading: loadingOrg } = useQuery<OrganizationRecord>(
    Queries.Organization.getById,
    [organizationId],
  );

  // Derive models and state
  const membership = useMemo(() => {
    const data = membershipData[0];
    return data
      ? new OrgMembership(data, data.name, data.user_profile, data.user_color)
      : null;
  }, [membershipData]);

  const organization = useMemo(
    () => (orgData[0] ? new Organization(orgData[0]) : null),
    [orgData],
  );

  const isResolving =
    loadingPersistedOrg ||
    (!!organizationId && (loadingMembership || loadingOrg));

  const switchOrganization = async (orgId: string) => {
    setOrganizationId(orgId);
    await AsyncStorage.setItem(STORAGE_KEYS.ORG_ID, orgId);
  };

  const value: MembershipContextType = {
    organization,
    membership,
    isResolving,
    switchOrganization,
    isManager: membership
      ? organization?.managerId === membership.userId
      : false,
  };

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
};
