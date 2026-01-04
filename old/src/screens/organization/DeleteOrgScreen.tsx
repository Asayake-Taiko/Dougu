import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { Button } from "@rneui/themed";
import { useUser } from "../../helper/context/UserContext";
import { callSignOut, handleError } from "../../helper/Utils";
import { useLoad } from "../../helper/context/LoadingContext";
import { DeleteOrgSreenProps } from "../../types/ScreenTypes";
import { deleteOrg } from "../../helper/EditUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function DeleteOrgScreen({ navigation }: DeleteOrgSreenProps) {
  const [orgName, setOrgName] = useState("");
  const { user, org, resetContext } = useUser();
  const { setIsLoading } = useLoad();

  const handleDelete = async () => {
    // delete organization
    if (orgName !== org!.name) {
      Alert.alert("Organization name does not match. Please try again.");
      return;
    }
    try {
      setIsLoading(true);
      await deleteOrg(org!.id);
      await callSignOut(setIsLoading, navigation, resetContext);
      await AsyncStorage.removeItem(user!.id + " currOrg");
      setIsLoading(false);
    } catch (e) {
      handleError("handleDelete", e as Error, setIsLoading);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirm Deletion</Text>
      <Text style={styles.label}>
        Please type the organization name to confirm deletion. This action is
        irreversible, and deletes all users, equipment, containers, and storages
        associated with the organization.
      </Text>
      <TextInput
        style={styles.input}
        value={orgName}
        onChangeText={setOrgName}
        placeholder={org!.name}
      />
      <Button
        radius={"md"}
        type="solid"
        icon={{ name: "trash", type: "font-awesome", color: "white" }}
        title="Delete"
        buttonStyle={styles.button}
        containerStyle={{ width: "80%" }}
        onPress={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "red",
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: "20%",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 16,
    width: "80%",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    width: "80%",
  },
});
