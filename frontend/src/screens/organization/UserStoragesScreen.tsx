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
import { MaterialCommunityIcons } from "@expo/vector-icons";

// project imports
import { UserStoragesScreenProps } from "../../types/navigation";
import { OrgMembership } from "../../types/models";
import MemberRow from "../../components/organization/MemberRow";
import { useMembership } from "../../lib/context/MembershipContext";
import { useQuery } from "@powersync/react-native";
import { OrgMembershipRecord } from "../../types/db";

/*
  Screen for viewing all members and storages in an organization
  It has two tabs: Members and Storages, where each tab displays
  its respective data
*/
export default function UserStoragesScreen({
  route,
  navigation,
}: UserStoragesScreenProps) {
  const { organization, isManager } = useMembership();
  if (!organization) return null;

  const { tabParam } = route.params;
  const [tab, setTab] = useState(tabParam);

  // Reactive members query
  const { data: membersData } = useQuery<OrgMembershipRecord & { full_name?: string; user_profile?: string }>(
    `SELECT m.*, u.full_name, u.profile as user_profile 
     FROM org_memberships m 
     LEFT JOIN users u ON m.user_id = u.id 
     WHERE m.organization_id = ?`,
    [organization?.id]
  );

  const members = useMemo(() =>
    membersData
      .map(m => new OrgMembership(m, m.full_name, m.user_profile))
      .sort((a, b) => a.name.localeCompare(b.name))
    , [membersData]);

  const [currData, setCurrData] = useState<OrgMembership[]>([]);

  // update our data everytime the tab or data changes
  useEffect(() => {
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
  }, [members, tab]);

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
        {tab === "Storages" && isManager ? (
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
