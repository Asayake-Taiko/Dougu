import React, { useLayoutEffect, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  MemberTabParamList,
  DrawerStackParamList,
} from "../../types/navigation";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { Text, View } from "react-native";
import { Colors } from "../../styles/global/colors";
import SplashScreen from "../splash";

// Screens
import EquipmentScreen from "./Equipment";
import SwapScreen from "./Swap";
import TeamScreen from "./Team";
import OrgInfoScreen from "./OrgInfo";
import { useMembership } from "../../lib/context/MembershipContext";

const Tab = createBottomTabNavigator<MemberTabParamList>();

/**
 * Sub-component to access EquipmentProvider context and handle its loading state
 */
function TabNavigatorContent({ organizationId }: { organizationId: string }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof FontAwesome5.glyphMap = "help-circle";

          if (route.name === "Equipment") {
            iconName = "home";
          } else if (route.name === "Swap") {
            iconName = "exchange-alt";
          } else if (route.name === "Team") {
            iconName = "users";
          } else if (route.name === "OrgInfo") {
            iconName = "info-circle";
          }

          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: "gray",
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
      <Tab.Screen
        name="OrgInfo"
        component={OrgInfoScreen}
        initialParams={{ organizationId }}
      />
    </Tab.Navigator>
  );
}

export default function MemberTabs({
  route,
  navigation,
}: DrawerScreenProps<DrawerStackParamList, "MemberTabs">) {
  const { organization, membership, isResolving, switchOrganization } =
    useMembership();

  // Update state and persist when route params change (coming from MyOrgs or other navigation)
  useEffect(() => {
    if (route.params?.organizationId) {
      const { organizationId: newId } = route.params;
      if (newId !== organization?.id) {
        switchOrganization(newId);
      }
    }
  }, [route.params, organization?.id, switchOrganization]);

  // set the header title
  useLayoutEffect(() => {
    if (organization?.name) {
      navigation.setOptions({
        headerTitle: organization.name,
      });
    }
  }, [organization?.name, navigation]);

  if (isResolving) {
    return <SplashScreen />;
  }

  if (!organization || !membership) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", padding: 20, marginTop: "50%" }}
      >
        <Text style={{ fontSize: 18, textAlign: "center" }}>
          No organization selected. Please select, create, or join an
          organization.
        </Text>
      </View>
    );
  }

  return <TabNavigatorContent organizationId={organization.id} />;
}
