import {
  useState,
  useContext,
  useEffect,
  useCallback,
  createContext,
} from "react";
import { DataStore } from "@aws-amplify/datastore";

import {
  EquipmentObj,
  ContainerObj,
  UserStorageData,
} from "../../types/ModelTypes";
import { EquipmentContextType } from "../../types/ContextTypes";
import { useUser } from "./UserContext";
import { getOrgData } from "../EquipmentUtils";
import { Equipment, Container, OrgUserStorage } from "../../models";
import { handleError } from "../Utils";

/* 
  Context only available within MemberTabs that distributes the equipment
  item and whether it's data is visible. By allowing all membertabs screens
  to share equipmentData, we ensure consistency and also custom selection of 
  which equipment id you'd like to swap
*/
const EquipmentContext = createContext<EquipmentContextType | undefined>(
  undefined,
);

export default function EquipmentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [equipmentItem, setEquipmentItem] = useState<EquipmentObj | null>(null);
  const [containerItem, setContainerItem] = useState<ContainerObj | null>(null);
  const [itemData, setItemData] = useState<Map<string, UserStorageData>>(
    new Map(),
  );
  const [visible, setVisible] = useState<boolean>(false);
  const [containerVisible, setContainerVisible] = useState<boolean>(false);
  const [swapContainerVisible, setSwapContainerVisible] =
    useState<boolean>(false);
  const { org } = useUser();

  const handleGetItems = useCallback(async () => {
    try {
      console.log("handleGetItems");
      const items = await getOrgData(org!.id);
      setItemData(items);
    } catch (error) {
      handleError("handleGetItems", error as Error, null);
    }
  }, [org]);

  // subscribe to and get all equipment in the organization
  useEffect(() => {
    const equipmentSubscription = DataStore.observe(Equipment).subscribe(() => {
      handleGetItems();
    });
    const containerSubscription = DataStore.observe(Container).subscribe(() => {
      handleGetItems();
    });
    const orgUserStorageSubscription = DataStore.observe(
      OrgUserStorage,
    ).subscribe(() => {
      handleGetItems();
    });

    handleGetItems();

    return () => {
      equipmentSubscription.unsubscribe();
      containerSubscription.unsubscribe();
      orgUserStorageSubscription.unsubscribe();
    };
  }, [handleGetItems]);

  // select a new default id for the equipment item passed in
  const modifyEquipmentItem = (item: EquipmentObj, newId: string) => {
    // find the equipment object in the equipmentData map
    const orgItem = itemData.get(item.assignedTo.id);
    if (!orgItem) return;
    let newOrgItem: UserStorageData | undefined;
    if (item.container) {
      newOrgItem = containerOrgItem(item, newId, orgItem);
    } else {
      newOrgItem = equipmentOrgItem(item, newId, orgItem);
    }
    if (!newOrgItem) return;
    itemData.set(item.assignedTo.name, newOrgItem);
  };

  // updates the orgItem's equipment object with the new equipment object
  const equipmentOrgItem = (
    item: EquipmentObj,
    newId: string,
    orgItem: UserStorageData,
  ): UserStorageData | undefined => {
    // find the index of the equipment object in the equipment array
    const index = orgItem.data.findIndex((e) => e.id === item.id);
    if (index === -1) return;
    // create a new equipment object swapping the id with the new id
    const newEquipment = { ...item, id: newId };
    setEquipmentItem(newEquipment);
    // update the equipment array with the new equipment object
    orgItem.data[index] = newEquipment;
    return orgItem;
  };

  // updates the orgItem's container object with the new equipment object
  const containerOrgItem = (
    item: EquipmentObj,
    newId: string,
    orgItem: UserStorageData,
  ): UserStorageData | undefined => {
    // find the index of the container with the equipment object
    const containerIdx = orgItem.data.findIndex(
      (e) => e.id === containerItem!.id,
    );
    // find idx of equipment object in the container
    const index = containerItem?.equipment.findIndex((e) => e.id === item.id);
    if (index === -1 || index === undefined) return;
    // create a new equipment object and container object
    const newEquipment = { ...item, id: newId };
    let newEquipmentArray = containerItem!.equipment;
    newEquipmentArray[index] = newEquipment;
    let newContainer = { ...containerItem!, equipment: newEquipmentArray };
    setContainerItem(newContainer);
    setEquipmentItem(newEquipment);
    orgItem.data[containerIdx] = newContainer;
    return orgItem;
  };

  return (
    <EquipmentContext.Provider
      value={{
        itemData,
        equipmentItem,
        setEquipmentItem,
        containerItem,
        setContainerItem,
        visible,
        setVisible,
        containerVisible,
        setContainerVisible,
        swapContainerVisible,
        setSwapContainerVisible,
        modifyEquipmentItem,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  );
}

// ensure that UserContext isn't undefined in useUser
export const useEquipment = (): EquipmentContextType => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error("useUEquipment must be used within a EquipmentProvider");
  }
  return context;
};
