import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { DataStore } from "aws-amplify/datastore";
import { Hub } from "aws-amplify/utils";
import { fetchAuthSession } from "aws-amplify/auth";

import { SyncScreenProps } from "../types/ScreenTypes";
import { useUser } from "../helper/context/UserContext";

/*
  after a user logs in, this screen is displayed while the app
  syncs datastore with the backend
*/
export default function SyncScreen({ route, navigation }: SyncScreenProps) {
  const { syncType, accessCode, newOrg } = route.params;
  const { user, setOrg } = useUser();

  // start DataStore and listen for DataStore ready event
  useEffect(() => {
    const handleDataStore = async () => {
      if (syncType !== "START") {
        await DataStore.clear();
        // wait for DataStore to clear (2 seconds)
        if (!user) return;
        setTimeout(async () => {
          // triggers a refresh so user groups are updated (which allows access to orgs)
          await fetchAuthSession({ forceRefresh: true });
          await DataStore.start();
        }, 2000);
      } else {
        await DataStore.start();
      }
    };

    // depending on where the user is coming from, navigate to the correct screen
    const handleNavigation = async () => {
      switch (syncType) {
        case "START":
          navigation.navigate("DrawerNav", { screen: "MyOrgs" });
          break;
        case "CREATE":
          setOrg(newOrg ? newOrg : null);
          navigation.navigate("AccessCode", {
            accessCode: accessCode ? accessCode : "ERROR",
          });
          break;
        case "JOIN":
          setOrg(newOrg ? newOrg : null);
          navigation.navigate("DrawerNav", {
            screen: "MemberTabs",
            params: {
              screen: "Equipment",
            },
          });
          break;
      }
    };

    handleDataStore();
    const listener = Hub.listen("datastore", async (hubData) => {
      const { event } = hubData.payload;
      // once DataStore is ready, navigate to the correct screen
      if (event === "ready") {
        setTimeout(() => {
          handleNavigation();
        }, 1000);
      }
    });

    return () => {
      listener();
    };
  }, [accessCode, navigation, newOrg, setOrg, syncType, user]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/asayake_taiko.png")}
        style={styles.circleImage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eceff1",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  circleImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginTop: 20,
  },
});
