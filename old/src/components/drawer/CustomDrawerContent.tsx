import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import {
  DrawerItem,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useLoad } from "../../helper/context/LoadingContext";
import { useUser } from "../../helper/context/UserContext";
import { callSignOut } from "../../helper/Utils";

// Create a custom drawer component to override default
// react navigation drawer
export default function CustomDrawerContent({
  navigation,
}: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const { setIsLoading } = useLoad();
  const { user, org, resetContext } = useUser();

  // Check if there is a current org when the user clicks on the current org button
  const handleCurrOrgNav = () => {
    if (org == null) {
      Alert.alert(
        "No Current Organization",
        "You must set an organization to view this.",
        [{ text: "OK" }],
      );
    } else {
      navigation.navigate("DrawerNav", {
        screen: "MemberTabs",
        params: {
          screen: "Equipment",
        },
      });
    }
  };

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        flex: 1,
        height: "100%",
      }}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>{user!.name}</Text>
      </View>
      <View style={styles.listContainer}>
        <DrawerItem
          label="Profile"
          onPress={() => {
            navigation.navigate("Profile");
          }}
        />
        <DrawerItem
          label="Current Org"
          onPress={() => {
            handleCurrOrgNav();
          }}
        />
        <DrawerItem
          label="My Orgs"
          onPress={() => {
            navigation.navigate("MyOrgs");
          }}
        />
        <DrawerItem
          label="Join Org!"
          onPress={() => {
            navigation.navigate("JoinOrg");
          }}
        />
        <DrawerItem
          label="Create an Org!"
          onPress={() => {
            navigation.navigate("CreateOrg");
          }}
        />
      </View>
      <View style={styles.footer}>
        <DrawerItem
          label="Logout"
          onPress={() => {
            callSignOut(setIsLoading, navigation, resetContext);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    justifyContent: "center",
    height: "10%",
    borderBottomColor: "grey",
    borderBottomWidth: 0.5,
  },
  headerText: {
    fontSize: 18,
    left: 20,
  },
  listContainer: {
    height: "80%",
  },
  footer: {
    height: "10%",
    justifyContent: "center",
    borderTopColor: "grey",
    borderTopWidth: 0.5,
  },
  profile: {
    left: 20,
  },
  circleImage: {
    width: 45,
    height: 45,
    borderRadius: 35 / 2,
    padding: 5,
    left: 5,
  },
});
