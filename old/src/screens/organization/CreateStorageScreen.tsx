import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ImageSourcePropType,
  StyleSheet,
} from "react-native";
import React from "react";
import { useState } from "react";
import { DataStore } from "@aws-amplify/datastore";

// project imports
import { useLoad } from "../../helper/context/LoadingContext";
import { OrgUserStorage, Organization, UserOrStorage } from "../../models";
import { useUser } from "../../helper/context/UserContext";
import { handleError } from "../../helper/Utils";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ProfileOverlay from "../../components/drawer/ProfileOverlay";
import ProfileDisplay from "../../components/ProfileDisplay";
import { uploadImage } from "../../helper/AWS";
import { useDimensions } from "../../helper/context/DimensionsContext";
import { useProfileStyles } from "../../styles/ProfileStyles";

/*
  Create storage screen allows a manager to create storage.
  A storage is a non-user entity where equipment can be assigned.
*/
export default function CreateStorageScreen() {
  const [profileSource, setProfileSource] =
    useState<ImageSourcePropType | null>(null);
  const [profileKey, setProfileKey] = useState<string>("default");
  const [profileVisible, setProfileVisible] = useState(false);
  const [name, onChangeName] = useState("");
  const [details, onChangeDetails] = useState("");
  const { setIsLoading } = useLoad();
  const { org } = useUser();
  const { windowWidth } = useDimensions();
  const profileStyles = useProfileStyles();

  // Create a new storage
  const handleCreate = async () => {
    try {
      // check that name isn't empty
      if (name === "") {
        throw new Error("Name must not be empty.");
      }
      setIsLoading(true);
      // create the storage
      const dataOrg = await DataStore.query(Organization, org!.id);
      if (dataOrg == null) throw new Error("Organization not found.");
      const storage = await DataStore.save(
        new OrgUserStorage({
          name: name,
          organization: dataOrg,
          type: UserOrStorage.STORAGE,
          details: details,
          group: org!.name,
          profile: profileKey,
        }),
      );
      // upload the profile image
      if (profileSource) {
        const path = `public/profiles/${storage.id}/profile.jpeg`;
        await uploadImage(profileSource, path);
      }
      setIsLoading(false);
      onChangeName("");
      onChangeDetails("");
      Alert.alert("Storage Created Successfully!");
    } catch (error) {
      handleError("handleCreate", error as Error, setIsLoading);
    }
  };

  return (
    <View style={profileStyles.container}>
      <TouchableOpacity
        style={profileStyles.profile}
        onPress={() => setProfileVisible(true)}
      >
        <ProfileDisplay
          isMini={false}
          profileKey={profileKey}
          source={profileSource}
          userId={null}
        />
        <View style={profileStyles.editButton}>
          <MaterialCommunityIcons name="pencil" size={windowWidth / 18} />
        </View>
      </TouchableOpacity>
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
      <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
        <Text style={styles.createBtnTxt}> Create </Text>
      </TouchableOpacity>
      <ProfileOverlay
        visible={profileVisible}
        setVisible={setProfileVisible}
        profileSource={profileSource}
        setProfileSource={setProfileSource}
        profileKey={profileKey}
        setProfileKey={setProfileKey}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  details: {
    height: 80,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  row1: {
    flex: 1,
    justifyContent: "center",
  },
  row2: {
    flex: 3,
  },
  rowHeader: {
    fontSize: 14,
    fontWeight: "bold",
    alignSelf: "center",
  },
  createBtn: {
    backgroundColor: "#791111",
    width: "50%",
    padding: 10,
    height: 50,
    alignSelf: "center",
    marginTop: 20,
  },
  createBtnTxt: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
