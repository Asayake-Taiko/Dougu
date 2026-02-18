import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../styles/global";

// project imports
import EquipmentTable from "../../components/organization/EquipmentTable";
import { ManageEquipmentScreenProps } from "../../types/navigation";
import { useMembership } from "../../lib/context/MembershipContext";

/*
  The screen that displays a list of equipment in the organization.
  A manager can navigate to creating from here, and also delete equipment.
*/
export default function ManageEquipmentScreen({
  navigation,
}: ManageEquipmentScreenProps) {
  const { organization } = useMembership();
  const [search, setSearch] = useState("");

  const handleCreate = () => {
    navigation.navigate("CreateEquipment");
  };

  if (!organization) return null;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#791111", "#550c0c"]} style={styles.header}>
        <Text style={styles.headerText}>{organization.name}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.searchHeader}>
          <View style={styles.searchBarContainer}>
            <MaterialCommunityIcons
              name="magnify"
              size={24}
              color="#828282"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search"
              placeholderTextColor={Colors.gray500}
              onChangeText={setSearch}
              value={search}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity onPress={handleCreate}>
            <View style={styles.addIconContainer}>
              <MaterialCommunityIcons name="plus" size={40} color="#333" />
            </View>
          </TouchableOpacity>
        </View>
        <EquipmentTable searchFilter={search} />
      </View>
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
  content: {
    flex: 1,
    width: "100%",
  },
  searchHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 0,
    width: "100%",
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#E0E0E0",
    backgroundColor: "#F4F4F4",
    height: 50,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: Colors.black,
  },
  addIconContainer: {
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    marginLeft: 15,
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
});
