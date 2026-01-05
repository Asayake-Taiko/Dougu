import React, { createContext, useContext, useState, ReactNode } from "react";

import { useAuth } from "./AuthContext";
import { useMembership } from "./MembershipContext";
import { Container, Equipment, OrgOwnership, Item } from "../../types/models";
import { db } from "../powersync/PowerSync";
import { useEquipmentData } from "../hooks/useEquipmentData";

interface EquipmentContextType {
  ownerships: Map<string, OrgOwnership>; // Key: membership.id, Value: OrgOwnership, Sorted by Name

  // Overlay state
  selectedEquipment: Equipment | null;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  selectedContainer: Container | null;
  setSelectedContainer: (container: Container | null) => void;

  // Actions
  deleteItem: (item: Item) => Promise<void>;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(
  undefined,
);

export const useEquipment = () => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error("useEquipment must be used within an EquipmentProvider");
  }
  return context;
};

export const EquipmentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { membership, isManager } = useMembership();
  const organizationId = membership?.organizationId;

  // Use optimized hook for data processing
  const ownerships = useEquipmentData(user, membership, organizationId);

  // Overlay state
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(
    null,
  );

  const deleteItem = async (item: Item) => {
    if (!isManager) {
      throw new Error("You do not have permission to delete this item");
    } else {
      await item.delete(db);
    }
  };

  const contextValue: EquipmentContextType = {
    ownerships,
    selectedEquipment,
    setSelectedEquipment,
    selectedContainer,
    setSelectedContainer,
    deleteItem,
  };

  return (
    <EquipmentContext.Provider value={contextValue}>
      {children}
    </EquipmentContext.Provider>
  );
};
