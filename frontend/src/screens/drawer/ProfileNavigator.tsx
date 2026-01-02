import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from './Profile';
import CreateOrgScreen from './CreateOrg';
import JoinOrgScreen from './JoinOrg';
import MyOrgsScreen from './MyOrgs';
import MemberTabs from '../member/TabNavigator';
// import OrgImageScreen from '../organization/OrgImageScreen';
import UserStoragesScreen from '../organization/UserStoragesScreen';
// import SheetScreen from '../organization/SheetScreen';
// import ManageEquipmentScreen from '../organization/ManageEquipmentScreen';
// import DeleteOrgScreen from '../organization/DeleteOrgScreen';
// import CreateEquipmentScreen from '../organization/CreateEquipmentScreen';
// import CreateStorageScreen from '../organization/CreateStorageScreen';
// import ItemImageScreen from '../organization/ItemImageScreen';
import MemberProfileScreen from '../organization/MemberProfileScreen';
import { DrawerStackParamList, ProfileStackParamList } from '../../types/navigation';
import { Colors } from '../../styles/global/colors';

import { MembershipProvider, useMembership } from '../../lib/context/MembershipContext';
import { EquipmentProvider } from '../../lib/context/EquipmentContext';

const Drawer = createDrawerNavigator<DrawerStackParamList>();
const RootStack = createStackNavigator<ProfileStackParamList>();

function ProfileDrawer() {
    return (
        <Drawer.Navigator
            initialRouteName="MemberTabs"
            screenOptions={{
                swipeEnabled: false,
                headerShown: true,
                drawerActiveTintColor: Colors.primary,
            }}
        >
            <Drawer.Screen
                name="MemberTabs"
                component={MemberTabs}
                options={{
                    drawerLabel: "Current Org",
                    title: "Current Org",
                }}
            />
            <Drawer.Screen
                name="MyOrgs"
                component={MyOrgsScreen}
                options={{ drawerLabel: "My Orgs", title: "My Orgs" }}
            />
            <Drawer.Screen
                name="JoinOrg"
                component={JoinOrgScreen}
                options={{ drawerLabel: "Join Org", title: "Join Org" }}
            />
            <Drawer.Screen
                name="CreateOrg"
                component={CreateOrgScreen}
                options={{ drawerLabel: "Create Org", title: "Create Org" }}
            />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
        </Drawer.Navigator>
    );
}

function ProfileNavigatorContent() {
    const { membershipId } = useMembership();

    return (
        <EquipmentProvider membershipId={membershipId}>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                <RootStack.Screen name="DrawerRoot" component={ProfileDrawer} />
                {/* <RootStack.Screen
                    name="OrgImage"
                    component={OrgImageScreen}
                    options={{ headerShown: true, title: 'Organization Image' }}
                /> */}
                <RootStack.Screen
                    name="UserStorages"
                    component={UserStoragesScreen}
                    options={{ headerShown: true, title: 'Users & Storages' }}
                />
                {/* <RootStack.Screen
                    name="Sheet"
                    component={SheetScreen}
                    options={{ headerShown: true, title: 'Equipment Sheet' }}
                />
                <RootStack.Screen
                    name="ManageEquipment"
                    component={ManageEquipmentScreen}
                    options={{ headerShown: true, title: 'Manage Equipment' }}
                />
                <RootStack.Screen
                    name="DeleteOrg"
                    component={DeleteOrgScreen}
                    options={{ headerShown: true, title: 'Delete Organization' }}
                />
                <RootStack.Screen
                    name="CreateEquipment"
                    component={CreateEquipmentScreen}
                    options={{ headerShown: true, title: 'Create Equipment' }}
                />
                <RootStack.Screen
                    name="CreateStorage"
                    component={CreateStorageScreen}
                    options={{ headerShown: true, title: 'Create Storage' }}
                />
                <RootStack.Screen
                    name="ItemImage"
                    component={ItemImageScreen}
                    options={{ headerShown: true, title: 'Item Image' }}
                /> */}
                <RootStack.Screen
                    name="MemberProfile"
                    component={MemberProfileScreen}
                    options={{ headerShown: true, title: 'Member Profile' }}
                />
            </RootStack.Navigator>
        </EquipmentProvider>
    );
}

export default function ProfileNavigator() {
    return (
        <MembershipProvider>
            <ProfileNavigatorContent />
        </MembershipProvider>
    );
}
