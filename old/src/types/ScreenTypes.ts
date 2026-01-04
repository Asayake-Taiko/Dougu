import type { NavigationProp } from "@react-navigation/core";
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import {
  DrawerScreenProps,
  DrawerNavigationProp,
} from "@react-navigation/drawer";
import type {
  CompositeScreenProps,
  CompositeNavigationProp,
} from "@react-navigation/native";
import type { MaterialTopTabScreenProps } from "@react-navigation/material-top-tabs";

import {
  RootStackParamList,
  DrawerParamList,
  OrgStackParamList,
  TabParamList,
} from "./NavigatorTypes";

/*
    Defines the types for the screen props used in the app.
    Basically, one type for each screen that is used.
*/

// Types for navigator screen props
export type DrawerNavProps = NativeStackScreenProps<
  RootStackParamList,
  "DrawerNav"
>;

export type HomeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;

export type SyncScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "SyncScreen"
>;

export type ResendCodeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ResendCode"
>;

export type ResetPasswordScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ResetPassword"
>;

export type AccessCodeScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "AccessCode"
>;

export type VerifyEmailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "VerifyEmail"
>;

// for CreateAcc and Login screens
export type NavigationOnlyProps = {
  navigation: NavigationProp<RootStackParamList>;
};

// drawer screen types
type JoinOrgNavigation = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, "JoinOrg">,
  NativeStackNavigationProp<RootStackParamList>
>;

export type JoinOrgScreenProps = {
  navigation: JoinOrgNavigation;
};

type CreateOrgNavigation = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, "CreateOrg">,
  NativeStackNavigationProp<RootStackParamList>
>;

export type CreateOrgScreenProps = {
  navigation: CreateOrgNavigation;
};

export type MyOrgsScreenProps = DrawerScreenProps<DrawerParamList, "MyOrgs">;

// Composite navigation due to nested navigate
export type ProfileScreenProps = CompositeNavigationProp<
  DrawerNavigationProp<DrawerParamList, "Profile">,
  NativeStackNavigationProp<RootStackParamList>
>;

// use compositeScreenProps if you need to access screens from multiple navigators
//(especially parent screens from child)
export type MemberTabsScreenProps = CompositeScreenProps<
  DrawerScreenProps<DrawerParamList, "MemberTabs">,
  NativeStackScreenProps<RootStackParamList>
>;

// OrgStackScreen types
export type OrgStackScreenProps = CompositeScreenProps<
  MaterialTopTabScreenProps<TabParamList, "OrgInfo">,
  CompositeScreenProps<
    DrawerScreenProps<DrawerParamList>,
    NativeStackScreenProps<RootStackParamList>
  >
>;

export type DeleteOrgSreenProps = CompositeScreenProps<
  NativeStackScreenProps<OrgStackParamList, "DeleteOrg">,
  CompositeScreenProps<
    MaterialTopTabScreenProps<TabParamList, "OrgInfo">,
    CompositeScreenProps<
      DrawerScreenProps<DrawerParamList>,
      NativeStackScreenProps<RootStackParamList>
    >
  >
>;

export type InfoScreenProps = NativeStackScreenProps<
  OrgStackParamList,
  "InfoScreen"
>;

export type ManageEquipmentScreenProps = NativeStackScreenProps<
  OrgStackParamList,
  "ManageEquipment"
>;

export type UserStoragesScreenProps = NativeStackScreenProps<
  OrgStackParamList,
  "UserStorages"
>;

export type UserStoragesNavigationProps = NativeStackNavigationProp<
  OrgStackParamList,
  "UserStorages",
  undefined
>;

export type CreateEquipmentScreenProps = NativeStackScreenProps<
  OrgStackParamList,
  "CreateEquipment"
>;

export type ItemImageScreenProps = NativeStackScreenProps<
  OrgStackParamList,
  "ItemImage"
>;

export type MemberProfileScreenProps = NativeStackScreenProps<
  OrgStackParamList,
  "MemberProfile"
>;
