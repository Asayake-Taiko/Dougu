import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import React from "react";
import { useState } from "react";
import { DataStore } from "@aws-amplify/datastore";
import { Tab } from "@rneui/themed";

// project imports
import CurrMembersDropdown from "../../components/CurrMembersDropdown";
import { OrgUserStorage, Organization } from "../../models";
import { useLoad } from "../../helper/context/LoadingContext";
import { useUser } from "../../helper/context/UserContext";
import { handleError } from "../../helper/Utils";
import ContainerDisplay from "../../components/member/ContainerDisplay";
import { CreateContainer, CreateEquipment } from "../../helper/CreateUtils";
import { CreateEquipmentScreenProps } from "../../types/ScreenTypes";
import { useItemImage } from "../../helper/context/ItemImageContext";
import { uploadImage } from "../../helper/AWS";
import EquipmentDisplay from "../../components/member/EquipmentDisplay";

/*
  Create equipment screen allows a manager to create equipment
  and assign it to a user/storage.
*/
export default function CreateEquipmentScreen({
  navigation,
}: CreateEquipmentScreenProps) {
  const [name, onChangeName] = useState("");
  const [quantity, onChangeQuantity] = useState<string>("");
  const [assignUser, setAssignUser] = useState<OrgUserStorage | null>(null);
  const [details, onChangeDetails] = useState("");
  const { imageSource, imageKey, equipmentColor, containerColor } =
    useItemImage();
  // index 0 is equipment, index 1 is container
  const [index, setIndex] = useState(0);
  const { setIsLoading } = useLoad();
  const { org } = useUser();

  // ensure all input values are valid
  const verifyValues = () => {
    // check that quantity > 1
    const quantityCount = parseInt(quantity);
    if (isNaN(quantityCount) || assignUser == null || name === "") {
      throw new Error("Please fill out all fields.");
    }
    if (quantityCount < 1 || quantityCount > 25) {
      throw new Error("You must make between 1 and 25 items at a time.");
    }
    return quantityCount;
  };

  // Create a new equipment and assign it to a user
  const handleCreate = async () => {
    try {
      setIsLoading(true);
      const quantityCount = verifyValues();
      // find the orgUserStorage to assign to
      const dataOrg = await DataStore.query(Organization, org!.id);
      const orgUserStorage = await DataStore.query(
        OrgUserStorage,
        assignUser!.id,
      );
      if (dataOrg == null || orgUserStorage == null) {
        throw new Error("Organization or User not found.");
      }
      // index 0 is equipment, index 1 is container
      if (index === 0) {
        // if imageSource is an uploaded image, upload it to S3
        // don't promise.all because we don't want to make equipment if image fails
        const path = `public/${org!.id}/equipment/${imageKey}`;
        await uploadImage(imageSource, path);
        await CreateEquipment(
          quantityCount,
          name,
          dataOrg,
          orgUserStorage,
          details,
          equipmentColor,
          imageKey,
        );
      } else {
        await CreateContainer(
          quantityCount,
          name,
          dataOrg,
          orgUserStorage,
          details,
          containerColor,
        );
      }
      onChangeName("");
      onChangeQuantity("");
      onChangeDetails("");
      setIsLoading(false);
    } catch (error) {
      handleError("CreateEquipment", error as Error, setIsLoading);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {index === 0 ? (
          <EquipmentDisplay
            color={equipmentColor}
            imageKey={imageKey}
            isMini={false}
            source={imageSource}
          />
        ) : (
          <ContainerDisplay color={containerColor} />
        )}
      </View>
      <View style={styles.rowContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ItemImage", { index: index })}
        >
          <Text style={styles.link}>Edit Item Image</Text>
        </TouchableOpacity>
      </View>
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
          <Text style={styles.rowHeader}>Type</Text>
        </View>
        <View style={styles.row2}>
          <View style={styles.toggleContainer}>
            <Tab
              value={index}
              onChange={setIndex}
              dense={true}
              buttonStyle={(active) =>
                active ? styles.selectedBtn : styles.button
              }
              titleStyle={(active) =>
                active ? styles.selectedText : styles.text
              }
              disableIndicator={true}
            >
              <Tab.Item>Equipment</Tab.Item>
              <Tab.Item>Container</Tab.Item>
            </Tab>
          </View>
        </View>
      </View>
      <View style={styles.rowContainer}>
        <View style={styles.row1}>
          <Text style={styles.rowHeader}>Quantity</Text>
        </View>
        <View style={styles.row2}>
          <TextInput
            style={styles.input}
            onChangeText={onChangeQuantity}
            value={quantity.toString()}
            placeholder="quantity"
            keyboardType="numeric"
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
      <CurrMembersDropdown setUser={setAssignUser} isCreate={true} />
      <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
        <Text style={styles.createBtnTxt}> Create </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#f6f6f6",
    borderRadius: 40,
    padding: 10,
  },
  createBtn: {
    backgroundColor: "#791111",
    width: "50%",
    padding: 10,
    height: 50,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 30,
  },
  createBtnTxt: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  container: {
    backgroundColor: "#fff",
    height: "100%",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 10,
  },
  details: {
    height: 80,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  link: {
    color: "#0000ff",
    fontSize: 14,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
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
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    marginHorizontal: "auto",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  selectedBtn: {
    backgroundColor: "#333333",
    padding: 10,
    borderRadius: 40,
  },
  selectedText: {
    color: "#ffffff",
  },
  text: {
    color: "#000000",
  },
});
