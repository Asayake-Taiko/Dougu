import { DataStore } from "@aws-amplify/datastore";

import { OrgUserStorage, Equipment, Container } from "../models";
import { ContainerObj, EquipmentObj } from "../types/ModelTypes";
import { Dispatch, SetStateAction } from "react";
import { handleError } from "./Utils";

/* 
    This file contains utility functions for swapping equipment and containers
    in SwapGestures.tsx. There are four main types:
    1. Equipment -> UserStorage
    2. Container -> UserStorage
    3. Equipment -> Container
    4. Equipment -> Out of Container
*/

// reassign the equipment to the new OrgUserStorage by the id passed in
// Equipment -> UserStorage
export const reassignEquipment = async (
  item: EquipmentObj,
  assignedTo: OrgUserStorage | null,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
) => {
  if (!assignedTo || item.assignedTo.id === assignedTo.id) return;
  setIsLoading(true);
  try {
    // ensure equipment and user exist
    const swapOrgUserStorage = await DataStore.query(
      OrgUserStorage,
      assignedTo.id,
    );
    const equip = await DataStore.query(Equipment, item.id);
    if (!swapOrgUserStorage) throw new Error("OrgUserStorage does not exist!");
    if (!equip) throw new Error("Equipment does not exist!");
    // reassign
    await DataStore.save(
      Equipment.copyOf(equip, (updated) => {
        updated.assignedTo = swapOrgUserStorage;
        updated.assignedToId = swapOrgUserStorage.id;
        updated.lastUpdatedDate = new Date().toISOString();
      }),
    );
  } catch (error) {
    handleError("ReassgnEquipment", error as Error, setIsLoading);
  }
  setIsLoading(false);
};

// reassign the container to the new OrgUserStorage by the id passed in
// Container -> UserStorage
export const reassignContainer = async (
  item: ContainerObj,
  assignedTo: OrgUserStorage | null,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
) => {
  if (!assignedTo || item.assignedTo.id === assignedTo.id) return;
  setIsLoading(true);
  try {
    // ensure container and user exist
    const swapOrgUserStorage = await DataStore.query(
      OrgUserStorage,
      assignedTo.id,
    );
    const container = await DataStore.query(Container, item.id);
    if (!swapOrgUserStorage) throw new Error("OrgUserStorage does not exist!");
    if (!container) throw new Error("Container does not exist!");
    // reassign the container to the new OrgUserStorage
    await DataStore.save(
      Container.copyOf(container, (updated) => {
        updated.assignedTo = swapOrgUserStorage;
        updated.assignedToId = swapOrgUserStorage.id;
        updated.lastUpdatedDate = new Date().toISOString();
      }),
    );
    // reassign all equipment that belong to the container
    const containerEquipment = await DataStore.query(Equipment, (c) =>
      c.containerId.eq(container.id),
    );
    containerEquipment.forEach(async (equip) => {
      await DataStore.save(
        Equipment.copyOf(equip, (updated) => {
          updated.assignedTo = swapOrgUserStorage;
          updated.assignedToId = swapOrgUserStorage.id;
          updated.lastUpdatedDate = new Date().toISOString();
        }),
      );
    });
  } catch (error) {
    handleError("ReassignContainer", error as Error, setIsLoading);
  }
  setIsLoading(false);
};

// reassign the equipment to the container by the id passed in
// Equipment -> Container
export const addEquipmentToContainer = async (
  item: EquipmentObj,
  containerItem: ContainerObj,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
) => {
  if (item.container === containerItem.id) return;
  setIsLoading(true);
  try {
    // ensure equipment and container exist
    const equip = await DataStore.query(Equipment, item.id);
    const container = await DataStore.query(Container, containerItem.id);
    if (!equip) throw new Error("Equipment does not exist!");
    if (!container) throw new Error("Container does not exist!");
    const contanierUser = await container.assignedTo;
    // equipment is reassigned to the container and container owner
    await DataStore.save(
      Equipment.copyOf(equip, (updated) => {
        updated.lastUpdatedDate = new Date().toISOString();
        updated.containerId = container.id;
        updated.assignedTo = contanierUser;
        updated.assignedToId = contanierUser.id;
      }),
    );
  } catch (error) {
    handleError("AddEquipmentToContainer", error as Error, setIsLoading);
  }
  setIsLoading(false);
};

// reassign the equipment out of the container
// Equipment -> Out of Container
export const moveOutOfContainer = async (
  item: EquipmentObj,
  assignedTo: OrgUserStorage | null,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
) => {
  setIsLoading(true);
  try {
    // ensure equipment and user exist
    const equip = await DataStore.query(Equipment, item.id);
    if (!equip) throw new Error("Equipment does not exist!");
    const user = assignedTo ? assignedTo : await equip.assignedTo;
    const DBUser = await DataStore.query(OrgUserStorage, user.id);
    if (!DBUser) throw new Error("User does not exist!");
    // equipment is reassigned to the user and removed from the container
    await DataStore.save(
      Equipment.copyOf(equip, (updated) => {
        updated.lastUpdatedDate = new Date().toISOString();
        updated.containerId = null;
        updated.assignedTo = user;
        updated.assignedToId = user.id;
      }),
    );
  } catch (error) {
    handleError("MoveOutOfContainer", error as Error, setIsLoading);
  }
  setIsLoading(false);
};
