import React, { useLayoutEffect, useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import { MemberTabParamList, DrawerStackParamList } from '../../types/navigation';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { Text, View, ActivityIndicator } from 'react-native';
import { Colors } from '../../styles/global/colors';
import * as SecureStore from 'expo-secure-store';
import SplashScreen from '../splash';

// Screens
import EquipmentScreen from './Equipment';
import SwapScreen from './Swap';
import TeamScreen from './Team';
import { EquipmentProvider, useEquipment } from '../../lib/context/EquipmentContext';

const Tab = createBottomTabNavigator<MemberTabParamList>();

const STORAGE_KEYS = {
    ORG_ID: 'lastSelection_orgId',
    ORG_NAME: 'lastSelection_orgName',
};

/**
 * Sub-component to access EquipmentProvider context and handle its loading state
 */
function TabNavigatorContent({ organizationId }: { organizationId: string }) {
    const { isLoading } = useEquipment();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 10, color: Colors.gray500 }}>Loading data...</Text>
            </View>
        );
    }
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    let iconName: keyof typeof FontAwesome5.glyphMap = 'help-circle';

                    if (route.name === 'Equipment') {
                        iconName = 'home';
                    } else if (route.name === 'Swap') {
                        iconName = 'exchange-alt';
                    } else if (route.name === 'Team') {
                        iconName = 'users';
                    }

                    return <FontAwesome5 name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen
                name="Equipment"
                component={EquipmentScreen}
                initialParams={{ organizationId }}
            />
            <Tab.Screen
                name="Swap"
                component={SwapScreen}
                initialParams={{ organizationId }}
            />
            <Tab.Screen
                name="Team"
                component={TeamScreen}
                initialParams={{ organizationId }}
            />
        </Tab.Navigator>
    );
}

export default function MemberTabs({ route, navigation }: DrawerScreenProps<DrawerStackParamList, 'MemberTabs'>) {
    const [organizationId, setOrganizationId] = useState<string | undefined>(route.params?.organizationId);
    const [organizationName, setOrganizationName] = useState<string | undefined>(route.params?.organizationName);
    const [isResolving, setIsResolving] = useState(true);

    // Initial load from SecureStore if params are missing
    useEffect(() => {
        async function loadPersistedOrg() {
            if (!organizationId || !organizationName) {
                try {
                    const id = await SecureStore.getItemAsync(STORAGE_KEYS.ORG_ID);
                    const name = await SecureStore.getItemAsync(STORAGE_KEYS.ORG_NAME);
                    if (id && name) {
                        setOrganizationId(id);
                        setOrganizationName(name);
                    }
                } catch (e) {
                    console.error("Failed to load persisted org", e);
                }
            }
            setIsResolving(false);
        }
        loadPersistedOrg();
    }, []);

    // Update state and persist when route params change
    useEffect(() => {
        if (route.params?.organizationId && route.params?.organizationName) {
            const { organizationId: newId, organizationName: newName } = route.params;
            setOrganizationId(newId);
            setOrganizationName(newName);

            // Persist for next time
            SecureStore.setItemAsync(STORAGE_KEYS.ORG_ID, newId);
            SecureStore.setItemAsync(STORAGE_KEYS.ORG_NAME, newName);
        }
    }, [route.params]);

    // set the header title
    useLayoutEffect(() => {
        if (organizationName) {
            navigation.setOptions({
                headerTitle: organizationName,
            });
        }
    }, [organizationName, navigation]);

    if (isResolving) {
        return <SplashScreen />;
    }

    if (!organizationId || !organizationName) {
        return (
            <View style={{ flex: 1, alignItems: 'center', padding: 20, marginTop: "50%" }}>
                <Text style={{ fontSize: 18, textAlign: 'center' }}>
                    No organization selected. Please select, create, or join an organization.
                </Text>
            </View>
        );
    }

    return (
        <EquipmentProvider organizationId={organizationId}>
            <TabNavigatorContent organizationId={organizationId} />
        </EquipmentProvider>
    );
}
