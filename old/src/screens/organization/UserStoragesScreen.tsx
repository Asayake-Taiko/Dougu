import React, { useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

// project imports
import { OrgUserStorage } from "../../models";
import { useUser } from "../../helper/context/UserContext";
import MemberRow from "../../components/organization/MemberRow";
import { UserStoragesScreenProps } from "../../types/ScreenTypes";
import { sortOrgUserStorages } from "../../helper/EquipmentUtils";
import { useEquipment } from "../../helper/context/EquipmentContext";
import { UserStorageData } from "../../types/ModelTypes";

/*
  Screen for viewing all members and storages in an organization
  It has two tabs: Members and Storages, where each tab displays
  its respective data
*/
export default function UserStoragesScreen({
  route,
  navigation,
}: UserStoragesScreenProps) {
  const { org, isManager } = useUser();
  const { itemData } = useEquipment();
  const { tabParam } = route.params;
  const [tab, setTab] = useState(tabParam);
  const [currData, setCurrData] = useState<OrgUserStorage[]>([]);
  const orgUserStorages = useMemo(() => {
    return Array.from(itemData.values()).map(
      (data: UserStorageData) => data.assignedTo,
    );
  }, [itemData]);

  // update our data everytime the tab or data changes
  useEffect(() => {
    const getData = async () => {
      let data;
      if (tab === "Members") {
        data = orgUserStorages.filter((item) => item.type === "USER");
      } else {
        data = orgUserStorages.filter((item) => item.type === "STORAGE");
      }
      data = sortOrgUserStorages(data);
      setCurrData(data);
    };

    getData();
  }, [orgUserStorages, tab]);

  // create a storage, only managers can create storages
  const handleCreate = async () => {
    if (!isManager)
      Alert.alert(
        "Authorization Error",
        "You do not have permission to create storages",
        [{ text: "OK" }],
      );
    else navigation.navigate("CreateStorage");
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#791111", "#550c0c"]} style={styles.header}>
        <Text style={styles.headerText}>{org!.name}</Text>
      </LinearGradient>
      <View style={styles.tab}>
        <TouchableOpacity
          style={[styles.button, tab === "Members" ? styles.selectedBtn : null]}
          onPress={() => setTab("Members")}
        >
          <Text
            style={[
              styles.buttonText,
              tab === "Members" ? styles.selectedText : null,
            ]}
          >
            Members
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            tab === "Storages" ? styles.selectedBtn : null,
          ]}
          onPress={() => setTab("Storages")}
        >
          <Text
            style={[
              styles.buttonText,
              tab === "Storages" ? styles.selectedText : null,
            ]}
          >
            Storages
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ width: Dimensions.get("window").width }}>
        {currData.map((item, index) => (
          <MemberRow key={index} navigation={navigation} item={item} />
        ))}
        {tab === "Storages" ? (
          <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
            <Text style={styles.createBtnTxt}>Create Storage</Text>
            <MaterialCommunityIcons name="crown" color={"#fff"} size={32} />
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    width: "90%",
    height: "20%",
    marginVertical: "5%",
    borderRadius: 20,
    justifyContent: "center",
    alignContent: "center",
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  tab: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  button: {
    width: "50%",
    padding: 10,
  },
  buttonText: {
    fontSize: 14,
    textAlign: "center",
    color: "#828282",
  },
  selectedBtn: {
    backgroundColor: "#E0E0E0",
  },
  selectedText: {
    color: "black",
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    height: 50,
    backgroundColor: "#333333",
    alignSelf: "center",
    borderRadius: 10,
    marginVertical: 10,
  },
  createBtnTxt: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    marginRight: 10,
  },
});
