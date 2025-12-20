import { OrgUserStorage } from "../models";

// equipment and containers are based on this interface
export interface ItemObj {
  id: string;
  label: string;
  color: Hex;
  count: number;
  assignedTo: OrgUserStorage;
  type: "equipment" | "container";
}

// how equipment data is stored in the app
export interface EquipmentObj extends ItemObj {
  image: string;
  data: string[];
  detailData: string[];
  container: string | null;
}

// how container data is stored in the app
export interface ContainerObj extends ItemObj {
  equipment: EquipmentObj[];
}

// how equipmentdata is stored in the app
export interface OrgItem {
  assignedToName: string;
  data: ItemObj[];
}

export interface UserStorageData {
  assignedTo: OrgUserStorage;
  data: ItemObj[];
}

// for current members dropdown
export type UserNames = {
  label: string;
  value: string;
  data: OrgUserStorage;
};

// SwapEquipment stuff
export type Position = {
  x: number;
  y: number;
};

// either listOne, listTwo, or container for the swapEquipment screen
export type ListCounts = "one" | "two" | "container";

// for sheetScreen inside OrgStackNavigator
export type csvSheet = {
  header: string[];
  identityCol: string[];
  values: string[][];
};

// equipment item background colors should be Hex
export type Hex = `#${string}`;
