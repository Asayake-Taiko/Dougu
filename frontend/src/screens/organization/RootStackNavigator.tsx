import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '../../types/navigation';
import UserStoragesScreen from './UserStoragesScreen';
import ManageEquipmentScreen from './ManageEquipmentScreen';
import MemberProfileScreen from './MemberProfileScreen';
import CreateStorageScreen from './CreateStorageScreen';
import SheetScreen from './SheetScreen';
import CreateEquipmentScreen from './CreateEquipmentScreen';
import { ProfileDrawer } from '../drawer/ProfileNavigator';
import { MembershipProvider } from '../../lib/context/MembershipContext';
import { EquipmentProvider } from '../../lib/context/EquipmentContext';

const RootStack = createStackNavigator<ProfileStackParamList>();

export default function RootStackNavigator() {
    return (
        <MembershipProvider>
            <EquipmentProvider>
                <RootStack.Navigator screenOptions={{ headerShown: false }}>
                    <RootStack.Screen name="DrawerRoot" component={ProfileDrawer} />
                    <RootStack.Screen
                        name="UserStorages"
                        component={UserStoragesScreen}
                        options={{ headerShown: true, title: 'Users & Storages' }}
                    />
                    <RootStack.Screen
                        name="ManageEquipment"
                        component={ManageEquipmentScreen}
                        options={{ headerShown: true, title: 'Manage Equipment' }}
                    />
                    <RootStack.Screen
                        name="MemberProfile"
                        component={MemberProfileScreen}
                        options={{ headerShown: true, title: 'Member Profile' }}
                    />
                    <RootStack.Screen
                        name="CreateStorage"
                        component={CreateStorageScreen}
                        options={{ headerShown: true, title: 'Create Storage' }}
                    />
                    <RootStack.Screen
                        name="Sheet"
                        component={SheetScreen}
                        options={{ headerShown: true, title: 'Sheet View' }}
                    />
                    <RootStack.Screen
                        name="CreateEquipment"
                        component={CreateEquipmentScreen}
                        options={{ headerShown: true, title: 'Create Equipment' }}
                    />
                </RootStack.Navigator>
            </EquipmentProvider>
        </MembershipProvider>
    );
}
