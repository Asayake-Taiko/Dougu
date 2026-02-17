import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "@powersync/react-native";
import { Queries } from "../powersync/queries";
import { ProfileRecord } from "../../types/db";
import { Profile } from "../../types/models";
import { useAuth } from "./AuthContext";

interface ProfileContextType {
  profile: Profile | null;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

interface ProfileProviderProps {
  children: React.ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
}) => {
  const { session } = useAuth();

  // Fetch the profile reactively using PowerSync
  const { data: profileRecords, isLoading } = useQuery<ProfileRecord>(
    Queries.Profile.getById,
    [session?.user?.id || ""],
  );

  const profile = useMemo(() => {
    const record = profileRecords[0];
    return record ? new Profile(record) : null;
  }, [profileRecords]);

  return (
    <ProfileContext.Provider value={{ profile, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
};
