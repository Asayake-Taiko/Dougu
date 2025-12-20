import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { OrgUserStorage } from "../../models";
import { useUser } from "../../helper/context/UserContext";
import ProfileDisplay from "../ProfileDisplay";
import { UserStoragesNavigationProps } from "../../types/ScreenTypes";

/* 
    Single row from the UserStorages list. Each 
    row contains the user's name and a delete button
*/
export default function MemberRow({
  navigation,
  item,
}: {
  navigation: UserStoragesNavigationProps;
  item: OrgUserStorage | null;
}) {
  const { org } = useUser();
  // check if the member that this row represents is a manager
  const memberManager = org!.manager === item?.user;
  const memberId = item?.type === "USER" ? item.user : item?.id;

  const viewProfile = () => {
    if (!item) return;
    navigation.navigate("MemberProfile", { member: item });
  };

  return (
    <View style={userStorage.row}>
      <View style={userStorage.profile}>
        <ProfileDisplay
          isMini={true}
          profileKey={item ? item.profile : "default"}
          source={null}
          userId={memberId}
        />
      </View>
      <View style={userStorage.nameRow}>
        <Text style={userStorage.name}>{item ? item.name : "NULL ERROR"}</Text>
        {memberManager ? (
          <MaterialCommunityIcons
            name="crown"
            color={"#791111"}
            size={32}
            style={{ marginLeft: 10 }}
          />
        ) : null}
      </View>
      {!memberManager ? ( //let's not delete the manager...
        <TouchableOpacity style={userStorage.icon} onPress={viewProfile}>
          <Entypo name="dots-three-horizontal" size={24} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const userStorage = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    flex: 9,
    alignItems: "center",
  },
  profile: {
    padding: 10,
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 14,
    marginLeft: 10,
    fontWeight: "bold",
  },
  icon: {
    justifyContent: "center",
    marginRight: 5,
    flex: 1,
    padding: 5,
  },
});
