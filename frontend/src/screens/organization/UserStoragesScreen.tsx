import React, { useEffect, useMemo, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// project imports
import { UserStoragesScreenProps } from "../../types/navigation";
import { OrgMembership } from "../../types/models";
import MemberRow from "../../components/organization/MemberRow";
import { useMembership } from "../../lib/context/MembershipContext";
import { useEquipment } from "../../lib/context/EquipmentContext";

/*
  Screen for viewing all members and storages in an organization
  It has two tabs: Members and Storages, where each tab displays
  its respective data
*/
export default function UserStoragesScreen({
  route,
  navigation,
}: UserStoragesScreenProps) {
  const { organization } = useMembership();
  const { tabParam } = route.params;
  const [tab, setTab] = useState(tabParam);
  const { ownerships } = useEquipment();

  const members = useMemo(() => {
    return Array.from(ownerships.values())
      .map((ownership) => ownership.membership)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [ownerships]);

  const [currData, setCurrData] = useState<OrgMembership[]>([]);

  // update our data everytime the tab or data changes
  useEffect(() => {
    if (!organization) return;
    const getData = async () => {
      let data;
      if (tab === "Members") {
        data = members.filter((item) => item.membershipType === "USER");
      } else {
        data = members.filter((item) => item.membershipType === "STORAGE");
      }
      setCurrData(data);
    };

    getData();
  }, [members, tab, organization]);

  if (!organization) return null;

  // create a storage, only managers can create storages
  const handleCreate = async () => {
    navigation.navigate("CreateStorage");
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#791111", "#550c0c"]} style={styles.header}>
        <Text style={styles.headerText}>{organization.name}</Text>
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
          <MemberRow key={index} item={item} />
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
