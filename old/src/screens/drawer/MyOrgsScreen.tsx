import React, { useState, useEffect } from "react";
import { StyleSheet, Text, FlatList, TouchableOpacity } from "react-native";
import { DataStore } from "@aws-amplify/datastore";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { OrgUserStorage, Organization } from "../../models";
import { useUser } from "../../helper/context/UserContext";
import { MyOrgsScreenProps } from "../../types/ScreenTypes";

/*
  This screen will display the organizations that the user is a part of.
  The user can select an organization to open the MemberTabs for that organization.
*/
export default function MyOrgsScreen({ navigation }: MyOrgsScreenProps) {
  const [orgNames, setOrgNames] = useState<{ label: string; value: number }[]>(
    [],
  );
  const { user, setOrg } = useUser();

  // useEffect to keep orgNames up to date
  useEffect(() => {
    // get the organizations that the user is a part of
    const getOrgs = async () => {
      let orgs = await DataStore.query(Organization, (c) =>
        c.UserOrStorages.user.eq(user!.id),
      );
      const orgData = orgs.map((org, index) => ({
        label: org["name"],
        value: index,
      }));
      setOrgNames(orgData);
    };

    const subscription = DataStore.observeQuery(OrgUserStorage).subscribe(
      () => {
        getOrgs();
      },
    );

    return () => subscription.unsubscribe();
  }, [user]);

  // set the current organization and navigate to the MemberTabs
  const setAndNavigate = async (orgName: string) => {
    const org = await DataStore.query(Organization, (c) => c.name.eq(orgName));
    // AsyncStorage helps us keep track of previous sessions on the device
    const key = user!.id + " currOrg";
    await AsyncStorage.setItem(key, JSON.stringify(org[0]));
    setOrg(org[0]);
    navigation.navigate("MemberTabs", { screen: "Equipment" });
  };

  const orgItem = ({ item }: { item: { label: string; value: number } }) => (
    <TouchableOpacity
      onPress={() => setAndNavigate(item.label)}
      style={styles.orgContainer}
    >
      <Text>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={orgNames}
      renderItem={orgItem}
      keyExtractor={(item) => item.value.toString()}
    />
  );
}

const styles = StyleSheet.create({
  orgContainer: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: "#777777",
    borderRadius: 5,
  },
});
