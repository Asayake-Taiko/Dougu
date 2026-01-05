import { Text, View, TextInput, StyleSheet } from "react-native";
import React, { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { ProfileStyles } from "../../styles/ProfileStyles";
import ProfileDisplay from "../../components/ProfileDisplay";
import ProfileOverlay from "../../components/drawer/ProfileOverlay";
import { useMembership } from "../../lib/context/MembershipContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { useModal } from "../../lib/context/ModalContext";
import { db } from "../../lib/powersync/PowerSync";
import { Logger } from "../../lib/utils/Logger";
import { PressableOpacity } from "../../components/PressableOpacity";
import { useNavigation } from "@react-navigation/native";
import { generateUUID } from "../../lib/utils/UUID";
import { Queries } from "../../lib/powersync/queries";

/*
  Create storage screen allows a manager to create storage.
  A storage is a non-user entity where equipment can be assigned.
*/
export default function CreateStorageScreen() {
  const navigation = useNavigation();
  const { organization, isManager } = useMembership();
  const { showSpinner, hideSpinner } = useSpinner();
  const { setMessage } = useModal();

  const [profileKey, setProfileKey] = useState<string>("default");
  const [profileVisible, setProfileVisible] = useState(false);
  const [name, onChangeName] = useState("");
  const [details, onChangeDetails] = useState("");

  // Create a new storage
  const handleCreate = async () => {
    if (!isManager) {
      setMessage("You do not have permission to create a storage.");
      return;
    }
    if (!name.trim()) {
      setMessage("Please enter a name for the storage.");
      return;
    }

    if (!organization) {
      setMessage("No active organization found.");
      return;
    }

    try {
      showSpinner();

      await db.execute(Queries.Membership.insert, [
        generateUUID(),
        organization.id,
        "STORAGE",
        null, // user_id
        name, // storage_name
        profileKey,
        details,
      ]);

      // Reset form and go back
      onChangeName("");
      onChangeDetails("");
      navigation.goBack();
    } catch (error) {
      Logger.error("Error creating storage:", error);
      setMessage("Failed to create storage. Please try again.");
    } finally {
      hideSpinner();
    }
  };

  return (
    <View style={ProfileStyles.container}>
      <PressableOpacity
        style={ProfileStyles.profile}
        onPress={() => setProfileVisible(true)}
      >
        <ProfileDisplay isMini={false} profileKey={profileKey} />
        <View style={ProfileStyles.editButton}>
          <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
        </View>
      </PressableOpacity>
      <View style={styles.rowContainer}>
        <View style={styles.row1}>
          <Text style={styles.rowHeader}>Name</Text>
        </View>
        <View style={styles.row2}>
          <TextInput
            style={styles.input}
            onChangeText={onChangeName}
            value={name}
            placeholder="name"
            keyboardType="default"
          />
        </View>
      </View>
      <View style={styles.rowContainer}>
        <View style={styles.row1}>
          <Text style={styles.rowHeader}>Details</Text>
        </View>
        <View style={styles.row2}>
          <TextInput
            style={styles.details}
            onChangeText={onChangeDetails}
            value={details}
            placeholder="details"
            keyboardType="default"
            multiline={true}
          />
        </View>
      </View>
      <PressableOpacity style={styles.createBtn} onPress={handleCreate}>
        <Text style={styles.createBtnTxt}> Create </Text>
      </PressableOpacity>
      <ProfileOverlay
        visible={profileVisible}
        setVisible={setProfileVisible}
        profileKey={profileKey}
        setProfileKey={setProfileKey}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 45,
    marginVertical: 12,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F9F9F9",
  },
  details: {
    height: 100,
    marginVertical: 12,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#F9F9F9",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  row1: {
    flex: 1,
  },
  row2: {
    flex: 3,
  },
  rowHeader: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginLeft: 10,
  },
  createBtn: {
    backgroundColor: "#791111",
    width: "85%",
    padding: 15,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createBtnTxt: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
