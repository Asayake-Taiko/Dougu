import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ProfileScreen from './Profile';
import CreateOrgScreen from './CreateOrg';
import JoinOrgScreen from './JoinOrg';
import OrgListScreen from './OrgList';

const Drawer = createDrawerNavigator();

export default function ProfileNavigator() {
    return (
        <Drawer.Navigator
            initialRouteName="Profile"
            screenOptions={{
                headerShown: true,
            }}
        >
            <Drawer.Screen name="Profile" component={ProfileScreen} />
            <Drawer.Screen name="CreateOrg" component={CreateOrgScreen} />
            <Drawer.Screen name="JoinOrg" component={JoinOrgScreen} />
            <Drawer.Screen name="OrgList" component={OrgListScreen} />
        </Drawer.Navigator>
    );
}
