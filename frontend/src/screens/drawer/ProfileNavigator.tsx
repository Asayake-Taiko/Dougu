import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from './Profile';
import CreateOrgScreen from './CreateOrg';
import JoinOrgScreen from './JoinOrg';
import MyOrgsScreen from './MyOrgs';
import MemberTabs from '../member/TabNavigator';
import EditOrgScreen from '../member/EditOrg';
import { DrawerStackParamList, ProfileStackParamList } from '../../types/navigation';
import { Colors } from '../../styles/global/colors';

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

export default function ProfileNavigator() {
    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="DrawerRoot" component={ProfileDrawer} />
            <RootStack.Screen
                name="EditOrg"
                component={EditOrgScreen}
                options={{
                    presentation: 'modal',
                    headerShown: true,
                    title: 'Edit Organization'
                }}
            />
        </RootStack.Navigator>
    );
}
