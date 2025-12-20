import { Dispatch, SetStateAction } from "react";
import { ItemObj } from "../types/ModelTypes";
import { DataStore } from "@aws-amplify/datastore";
import {
  Equipment,
  Container,
  Organization,
  LazyOrganization,
} from "../models";
import { handleError } from "./Utils";
import { Alert } from "react-native";

const deleteContainer = async (
  item: ItemObj,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
) => {
  try {
    setIsLoading(true);
    const toDelete = await DataStore.query(Container, item.id);
    const toDeleteEquipment = await DataStore.query(Equipment, (c) =>
      c.containerId.eq(item.id),
    );
    if (toDelete == null) throw new Error("Container not found");
    await DataStore.delete(toDelete);
    for (let i = 0; i < toDeleteEquipment.length; i++) {
      await DataStore.delete(toDeleteEquipment[i]);
    }
    setIsLoading(false);
    Alert.alert("Container Deleted Successfully!");
  } catch (error) {
    handleError("deleteContainer", error as Error, setIsLoading);
  }
};

const deleteEquipment = async (
  item: ItemObj,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
) => {
  try {
    setIsLoading(true);
    const toDelete = await DataStore.query(Equipment, item.id);
    if (toDelete == null) throw new Error("Equipment not found");
    await DataStore.delete(toDelete);
    setIsLoading(false);
    Alert.alert("Equipment Deleted Successfully!");
  } catch (error) {
    handleError("deleteEquipment", error as Error, setIsLoading);
  }
};

// make sure the owner wants to delete the equipment
export const handleEdit = (
  equipment: ItemObj,
  isManager: boolean,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
) => {
  if (!isManager) {
    Alert.alert("You must be a manager to edit equipment");
    return;
  }
  Alert.alert("Delete Equipment", "Would you like to delete this equipment?", [
    {
      text: "Delete",
      onPress: () => {
        if (equipment.type === "container")
          deleteContainer(equipment, setIsLoading);
        else deleteEquipment(equipment, setIsLoading);
      },
      style: "destructive",
    },
    {
      text: "Cancel",
      style: "cancel",
    },
  ]);
};

export const editOrgImage = async (
  orgId: string,
  image: string,
): Promise<LazyOrganization> => {
  const orgUserStorages = await DataStore.query(Organization, orgId);
  if (!orgUserStorages) throw new Error("Organization not found");
  const newOrg = await DataStore.save(
    Organization.copyOf(orgUserStorages, (updated) => {
      updated.image = image;
    }),
  );
  return newOrg;
};

export const deleteOrg = async (orgId: string) => {
  const org = await DataStore.query(Organization, orgId);
  if (!org) throw new Error("Organization not found");
  await DataStore.delete(org);
};
