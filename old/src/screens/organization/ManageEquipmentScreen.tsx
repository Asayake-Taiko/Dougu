import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SearchBar } from "@rneui/themed";

// project imports
import EquipmentTable from "../../components/organization/EquipmentTable";
import { ManageEquipmentScreenProps } from "../../types/ScreenTypes";
import { useUser } from "../../helper/context/UserContext";

/*
  The screen that displays a list of equipment in the organization.
  A manager can navigate to creating from here, and also delete equipment.
*/
export default function ManageEquipmentScreen({
  navigation,
}: ManageEquipmentScreenProps) {
  const { isManager } = useUser();
  const [search, setSearch] = useState("");

  const updateSearch = (search: string) => {
    setSearch(search);
  };

  const handleCreate = () => {
    if (isManager) {
      navigation.navigate("CreateEquipment");
    } else {
      Alert.alert(
        "Authorization Error",
        "You do not have permission to create equipment",
        [{ text: "OK" }],
      );
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchBar}>
            <SearchBar
              placeholder="Search"
              onChangeText={updateSearch}
              value={search}
              platform="android"
              containerStyle={{ height: 30 }}
              inputContainerStyle={{ height: 10 }}
            />
          </View>
          <TouchableOpacity onPress={handleCreate}>
            <Ionicons name="add" size={50} style={styles.addIcon} />
          </TouchableOpacity>
        </View>
        <EquipmentTable searchFilter={search} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  addIcon: {
    backgroundColor: "#f4f4f4",
    borderRadius: 10,
    marginLeft: 20,
  },
  searchBar: {
    width: "80%",
    borderWidth: 4,
    borderRadius: 10,
    borderColor: "#f4f4f4",
    height: 50,
    justifyContent: "center",
  },
});
