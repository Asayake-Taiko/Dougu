import type {
  StackNavigationProp,
  StackScreenProps,
} from "@react-navigation/stack";
import type { RouteProp, CompositeScreenProps } from "@react-navigation/native";
import type {
  DrawerNavigationProp,
  DrawerScreenProps,
} from "@react-navigation/drawer";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { OrgMembership } from "./models";

// Auth Stack Parameter List
export type AuthStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  SendCode: undefined;
  ResetPassword: { email: string };
};

// Member Tab Parameter List
export type MemberTabParamList = {
  Equipment: { organizationId: string };
  Swap: { organizationId: string };
  Team: { organizationId: string };
  OrgInfo: { organizationId: string };
};

// Drawer Stack Parameter List
export type DrawerStackParamList = {
  Profile: undefined;
  MyOrgs: undefined;
  JoinOrg: undefined;
  CreateOrg: undefined;
  MemberTabs: { organizationId: string; organizationName: string } | undefined;
};

// Profile Stack Parameter List (Overlays everything)
export type ProfileStackParamList = {
  DrawerRoot: undefined;
  UserStorages: { tabParam: "Members" | "Storages" };
  Sheet: undefined;
  ManageEquipment: undefined;
  DeleteOrg: undefined;
  CreateEquipment: undefined;
  CreateStorage: undefined;
  ItemImage: { index: number };
  MemberProfile: { member: OrgMembership };
};

// Navigation props for Auth screens
export type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Login"
>;
export type CreateAccountScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "CreateAccount"
>;
export type SendCodeScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "SendCode"
>;

// Route props for Auth screens
export type ResetPasswordScreenRouteProp = RouteProp<
  AuthStackParamList,
  "ResetPassword"
>;

// Navigation props for Drawer screens
export type ProfileScreenNavigationProp = DrawerNavigationProp<
  DrawerStackParamList,
  "Profile"
>;
export type MyOrgsScreenNavigationProp = DrawerNavigationProp<
  DrawerStackParamList,
  "MyOrgs"
>;
export type JoinOrgScreenNavigationProp = DrawerNavigationProp<
  DrawerStackParamList,
  "JoinOrg"
>;
export type CreateOrgScreenNavigationProp = DrawerNavigationProp<
  DrawerStackParamList,
  "CreateOrg"
>;

// Screen props for Member Tabs (Composed with Drawer and Root Stack)
export type MemberTabScreenProps<T extends keyof MemberTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MemberTabParamList, T>,
    CompositeScreenProps<
      DrawerScreenProps<DrawerStackParamList>,
      StackScreenProps<ProfileStackParamList>
    >
  >;

// Screen props for Profile Stack
export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  StackScreenProps<ProfileStackParamList, T>;

export type InfoScreenProps = MemberTabScreenProps<"OrgInfo">;
export type UserStoragesScreenProps = ProfileStackScreenProps<"UserStorages">;
export type SheetScreenProps = ProfileStackScreenProps<"Sheet">;
export type ManageEquipmentScreenProps =
  ProfileStackScreenProps<"ManageEquipment">;
export type DeleteOrgScreenProps = ProfileStackScreenProps<"DeleteOrg">;
export type CreateEquipmentScreenProps =
  ProfileStackScreenProps<"CreateEquipment">;
export type CreateStorageScreenProps = ProfileStackScreenProps<"CreateStorage">;
export type ItemImageScreenProps = ProfileStackScreenProps<"ItemImage">;
export type MemberProfileScreenProps = ProfileStackScreenProps<"MemberProfile">;
