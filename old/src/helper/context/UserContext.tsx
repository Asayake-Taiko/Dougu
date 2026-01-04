import React, { useState, useContext, useEffect } from "react";
import { DataStore } from "@aws-amplify/datastore";

import { Organization, OrgUserStorage, UserOrStorage } from "../../models";
import { UserType, UserContextType } from "../../types/ContextTypes";

/* 
  Context that distributes the user object, organization object, and the user's organization object
  so that amplify datastore calls won't need to query for it 
*/
const UserContext = React.createContext<UserContextType | undefined>(undefined);

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserType | null>(null);
  const [org, setOrg] = useState<Organization | null>(null);
  const [orgUserStorage, setOrgUserStorage] = useState<OrgUserStorage | null>(
    null,
  );
  const [contextLoading, setIsContextLoading] = useState<boolean>(true);
  const [isManager, setIsManager] = useState<boolean>(false);

  // When the user and org are set, get the user's organization object
  useEffect(() => {
    // uses datastore to query the orgUserStorage from org and user
    const getOrgUserStorage = async () => {
      if (!org || !user) return;
      const orgUser = await DataStore.query(OrgUserStorage, (c) =>
        c.and((c) => [
          c.organizationUserOrStoragesId.eq(org.id),
          c.user.eq(user.id),
          c.type.eq(UserOrStorage.USER),
        ]),
      );
      setOrgUserStorage(orgUser[0]);
      setIsManager(user.id === org.manager);
      setIsContextLoading(false);
    };

    getOrgUserStorage();
  }, [org, user]);

  // cleans up the context upon signing out
  const resetContext = () => {
    setUser(null);
    setOrg(null);
    setOrgUserStorage(null);
    setIsContextLoading(true);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        org,
        setOrg,
        orgUserStorage,
        isManager,
        setIsManager,
        contextLoading,
        resetContext,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// ensure that UserContext isn't undefined in useUser
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
