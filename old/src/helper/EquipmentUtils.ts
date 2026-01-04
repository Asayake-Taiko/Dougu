import { DataStore } from "@aws-amplify/datastore";

import { Container, Equipment } from "../models";
import {
  EquipmentObj,
  ContainerObj,
  csvSheet,
  Hex,
  UserStorageData,
} from "../types/ModelTypes";
import { OrgUserStorage } from "../models";

// speed up localCompare sorting by using a collator
const collator = new Intl.Collator("en", {
  numeric: true,
  sensitivity: "base",
});

// sort the orgUserStorages by name
export const sortOrgUserStorages = (
  orgUserStorages: OrgUserStorage[],
): OrgUserStorage[] => {
  return orgUserStorages.sort((a, b) => collator.compare(a.name, b.name));
};

// chunk the equipment into groups of size
export const chunkArray = <T>(items: T[], size: number) =>
  items.reduce(
    (acc, _, i) => (i % size ? acc : [...acc, items.slice(i, i + size)]),
    [] as T[][],
  );

// get the csv data for the organization to export to google sheets
export const getCsvData = (
  orgItems: Map<string, UserStorageData>,
  showEmpty: boolean,
  showContainerEquip: boolean,
): csvSheet => {
  const counts: { [key: string]: { [key: string]: number } } = {};
  // get all the unique equipment labels
  const uniqueLabels: { [key: string]: number } = {};
  // fill out dictionary with equipment counts for each user
  orgItems.forEach((value) => {
    const assignedToName = value.assignedTo.name;
    const data = value.data;
    // skip empty users if showEmpty is false
    if (!showEmpty && data.length === 0) return;
    counts[assignedToName] = {};
    data.forEach((equip) => {
      counts[assignedToName][equip.label] ??= 0;
      uniqueLabels[equip.label] ??= 0;
      if (equip.type === "equipment") {
        const count = (equip as EquipmentObj).count;
        counts[assignedToName][equip.label] += count;
        uniqueLabels[equip.label] += count;
      } else {
        // count the container
        counts[assignedToName][equip.label] += 1;
        uniqueLabels[equip.label] += 1;
        // if showContainerEquip is false, don't count the equipment in the container
        if (!showContainerEquip) return;
        // count the equipment in the container
        (equip as ContainerObj).equipment.forEach((equip) => {
          counts[assignedToName][equip.label] ??= 0;
          uniqueLabels[equip.label] ??= 0;
          counts[assignedToName][equip.label] += equip.count;
          uniqueLabels[equip.label] += equip.count;
        });
      }
    });
  });
  const assignedToNames = Object.keys(counts).sort();
  const equipmentLabels = Object.keys(uniqueLabels).sort();
  const identityCol = [...assignedToNames, "Total"];
  let csvContent: string[][] = [];
  // column major order
  equipmentLabels.forEach((label) => {
    const col: string[] = [];
    assignedToNames.forEach((name) => {
      const countStr = counts[name][label]
        ? counts[name][label].toString()
        : "0";
      col.push(countStr);
    });
    // add the total count for each equipment label
    col.push(uniqueLabels[label].toString());
    csvContent.push(col);
  });
  return {
    header: equipmentLabels,
    identityCol: identityCol,
    values: csvContent,
  };
};

const processEquipmentData = (
  equipment: Equipment[],
  orgUserStorageMap: Map<string, OrgUserStorage>,
): EquipmentObj[] => {
  const equipmentMap = new Map<string, EquipmentObj>();
  equipment.forEach((equip) => {
    const orgUserStorage = orgUserStorageMap.get(equip.assignedToId);
    if (!orgUserStorage) throw new Error("OrgUserStorage not found");
    const orgUserStorageName = orgUserStorage.name;
    // duplicate
    const key = equip.containerId
      ? orgUserStorageName + equip.name + equip.containerId
      : orgUserStorageName + equip.name;
    const existingEquip = equipmentMap.get(key);
    if (existingEquip) {
      existingEquip.count += 1;
      existingEquip.data.push(equip.id);
      existingEquip.detailData.push(equip.details || "");
    } else {
      // new equipment
      equipmentMap.set(key, {
        id: equip.id,
        label: equip.name,
        color: equip.color as Hex,
        count: 1,
        type: "equipment",
        image: equip.image,
        data: [equip.id],
        detailData: [equip.details || ""],
        assignedTo: orgUserStorage,
        container: equip.containerId || null,
      });
    }
  });

  return Array.from(equipmentMap.values());
};

export const getOrgData = async (
  orgId: string,
): Promise<Map<string, UserStorageData>> => {
  let orgData: Map<string, UserStorageData> = new Map();
  const [orgUserStorages, equipment, containers] = await Promise.all([
    DataStore.query(OrgUserStorage, (c) =>
      c.organizationUserOrStoragesId.eq(orgId),
    ),
    DataStore.query(Equipment, (c) => c.organizationEquipmentId.eq(orgId)),
    DataStore.query(Container, (c) => c.organizationContainersId.eq(orgId)),
  ]);
  const orgUserStorageMap = new Map<string, OrgUserStorage>();
  orgUserStorages.forEach((storage) => {
    orgUserStorageMap.set(storage.id, storage);
    orgData.set(storage.id, { assignedTo: storage, data: [] });
  });
  const containerMap = new Map<string, ContainerObj>();
  containers.forEach((container) => {
    const assignedTo = orgUserStorageMap.get(container.assignedToId);
    if (!assignedTo) throw new Error("OrgUserStorage not found");
    containerMap.set(container.id, {
      id: container.id,
      label: container.name,
      color: container.color as Hex,
      count: 1,
      assignedTo: assignedTo,
      equipment: [],
      type: "container",
    });
  });
  const equipmentData = processEquipmentData(equipment, orgUserStorageMap);
  // separate equipment that is in a container to part of a containerObj
  equipmentData?.forEach((equip) => {
    if (!equip.assignedTo) throw new Error("Equipment has no assignedTo");
    if (equip.container && containerMap.has(equip.container)) {
      const container = containerMap.get(equip.container);
      if (!container) throw new Error("Container not found");
      container.equipment.push(equip);
    } else {
      const dataObj = orgData.get(equip.assignedTo.id);
      if (!dataObj) throw new Error("OrgData not found");
      dataObj.data.push(equip);
    }
  });
  // add each containerObj to userData
  containerMap.forEach((container) => {
    if (!container.assignedTo) throw new Error("Container has no assignedTo");
    const dataObj = orgData.get(container.assignedTo.id);
    if (!dataObj) throw new Error("OrgData not found");
    dataObj.data.push(container);
  });
  // sort the item data inside each UserStorageData
  orgData.forEach((value) => {
    value.data.sort((a, b) => collator.compare(a.label, b.label));
  });
  return orgData;
};

export const sortOrgItems = (
  orgItems: Map<string, UserStorageData>,
): UserStorageData[] => {
  let orgItemsArray: UserStorageData[] = [];
  let emptyItemsArray: UserStorageData[] = [];
  orgItems.forEach((value) => {
    if (value.data.length > 0) {
      orgItemsArray.push(value);
    } else {
      emptyItemsArray.push(value);
    }
  });
  orgItemsArray.sort((a, b) =>
    collator.compare(a.assignedTo.name, b.assignedTo.name),
  );
  emptyItemsArray.sort((a, b) =>
    collator.compare(a.assignedTo.name, b.assignedTo.name),
  );
  return orgItemsArray.concat(emptyItemsArray);
};
