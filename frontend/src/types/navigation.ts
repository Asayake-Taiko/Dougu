import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { DrawerNavigationProp, DrawerScreenProps } from '@react-navigation/drawer';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

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
};

// Drawer Stack Parameter List
export type DrawerStackParamList = {
    Profile: undefined;
    MyOrgs: undefined;
    JoinOrg: undefined;
    CreateOrg: undefined;
    MemberTabs: { organizationId: string; organizationName: string } | undefined;
};

// Navigation props for Auth screens
export type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;
export type CreateAccountScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'CreateAccount'>;
export type SendCodeScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SendCode'>;

// Route props for Auth screens
export type ResetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

// Navigation props for Drawer screens
export type ProfileScreenNavigationProp = DrawerNavigationProp<DrawerStackParamList, 'Profile'>;
export type MyOrgsScreenNavigationProp = DrawerNavigationProp<DrawerStackParamList, 'MyOrgs'>;
export type JoinOrgScreenNavigationProp = DrawerNavigationProp<DrawerStackParamList, 'JoinOrg'>;
export type CreateOrgScreenNavigationProp = DrawerNavigationProp<DrawerStackParamList, 'CreateOrg'>;

// Screen props for Member Tabs (Composed with Drawer)
export type MemberTabScreenProps<T extends keyof MemberTabParamList> = CompositeScreenProps<
    BottomTabScreenProps<MemberTabParamList, T>,
    DrawerScreenProps<DrawerStackParamList>
>;
