import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProfileScreen from './Profile';
import CreateOrgScreen from './CreateOrg';
import JoinOrgScreen from './JoinOrg';
import MyOrgsScreen from './MyOrgs';
import { DrawerStackParamList } from '../../types/navigation';

const Drawer = createDrawerNavigator<DrawerStackParamList>();

export default function ProfileNavigator() {
    return (
        <Drawer.Navigator
            initialRouteName="Profile"
            screenOptions={{
                headerShown: true,
            }}
        >
            <Drawer.Screen name="Profile" component={ProfileScreen} />
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
        </Drawer.Navigator>
    );
}
