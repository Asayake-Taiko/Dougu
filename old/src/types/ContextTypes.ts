import { Dispatch, SetStateAction } from "react";
import { OrgUserStorage, Organization } from "../models";
import { EquipmentObj, ContainerObj, Hex, UserStorageData } from "./ModelTypes";
import { ImageSourcePropType } from "react-native";

/*
  Defines the types for the context objects used in the app.
  these contests are used to store and share data between components.
*/
// this context is set whenever the useer logs in
export type UserType = {
  name: string;
  email: string;
  id: string;
  profile: string;
};

export type ImageContextType = {
  imageMap: Map<string, ImageSourcePropType>;
};

// shared between all signed-in components
export type UserContextType = {
  user: UserType | null;
  setUser: Dispatch<SetStateAction<UserType | null>>;
  org: Organization | null;
  setOrg: Dispatch<SetStateAction<Organization | null>>;
  orgUserStorage: OrgUserStorage | null;
  isManager: boolean;
  setIsManager: Dispatch<SetStateAction<boolean>>;
  contextLoading: boolean;
  resetContext: () => void;
};

// distributed through the entire app to show a loading spinner
export type LoadingContextType = {
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
};

// tracks the dimensions of the window for responsive design
export type DimensionsContextType = {
  windowWidth: number;
  windowHeight: number;
};

// tracks whether the user is online or not, and starts a background process
// to sync data when the user comes back online
export type NetworkContextType = {
  isConnected: boolean;
  setIsConnected: Dispatch<SetStateAction<boolean>>;
};

//used for custom header logic in InfoScreen of MemberTabs
export type HeaderContextType = {
  infoFocus: boolean;
  setInfoFocus: Dispatch<SetStateAction<boolean>>;
  orgStackFocus: boolean;
  setOrgStackFocus: Dispatch<SetStateAction<boolean>>;
};

// used to store all data related to an organization
export type EquipmentContextType = {
  itemData: Map<string, UserStorageData>;
  equipmentItem: EquipmentObj | null;
  setEquipmentItem: Dispatch<SetStateAction<EquipmentObj | null>>;
  containerItem: ContainerObj | null;
  setContainerItem: Dispatch<SetStateAction<ContainerObj | null>>;
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  containerVisible: boolean;
  setContainerVisible: Dispatch<SetStateAction<boolean>>;
  swapContainerVisible: boolean;
  setSwapContainerVisible: Dispatch<SetStateAction<boolean>>;
  modifyEquipmentItem: (item: EquipmentObj, newId: string) => void;
};

// handles context for creating items in CreateEquipment
export type ItemImageContextType = {
  imageSource: ImageSourcePropType | null;
  setImageSource: Dispatch<SetStateAction<ImageSourcePropType | null>>;
  imageKey: string;
  setImageKey: Dispatch<SetStateAction<string>>;
  equipmentColor: Hex;
  setEquipmentColor: Dispatch<SetStateAction<Hex>>;
  containerColor: Hex;
  setContainerColor: Dispatch<SetStateAction<Hex>>;
};
