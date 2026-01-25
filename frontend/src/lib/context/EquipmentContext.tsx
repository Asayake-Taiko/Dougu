import React, { createContext, useContext, useState, ReactNode } from "react";

import { useAuth } from "./AuthContext";
import { useMembership } from "./MembershipContext";
import { Container, Equipment } from "../../types/models";
import { OrgOwnership } from "../../types/other";
import { useEquipmentData } from "../hooks/useEquipmentData";

interface EquipmentContextType {
  ownerships: Map<string, OrgOwnership>; // Key: membership.id, Value: OrgOwnership, Sorted by Name

  // Overlay state
  selectedEquipment: Equipment | null;
  setSelectedEquipment: (equipment: Equipment | null) => void;
  selectedContainer: Container | null;
  setSelectedContainer: (container: Container | null) => void;
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
  const { session } = useAuth();
  const { membership } = useMembership();
  const organizationId = membership?.organizationId;

  // Use optimized hook for data processing
  const ownerships = useEquipmentData(
    session?.user.id,
    membership,
    organizationId,
  );

  // Overlay state
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(
    null,
  );

  const contextValue: EquipmentContextType = {
    ownerships,
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
