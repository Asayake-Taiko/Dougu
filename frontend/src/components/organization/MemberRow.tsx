import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";

import { useMembership } from "../../lib/context/MembershipContext";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { OrgMembership } from "../../types/models";
import { ProfileStackParamList } from "../../types/navigation";
import DisplayImage from "../DisplayImage";
import { PressableOpacity } from "../PressableOpacity";

/* 
    Single row from the UserStorages list. Each 
    row contains the user's name and a delete button
*/
export default function MemberRow({ item }: { item: OrgMembership }) {
  const { organization } = useMembership();
  const navigation =
    useNavigation<StackNavigationProp<ProfileStackParamList>>();

  if (!organization || !item) return null;

  // check if the member that this row represents is a manager
  const memberManager = organization.managerId === item.userId;

  const viewProfile = () => {
    navigation.navigate("MemberProfile", { member: item });
  };

  return (
    <View style={userStorage.row}>
      <View style={userStorage.profile}>
        <DisplayImage
          type="User"
          imageKey={item.profile}
          style={userStorage.profileMini}
        />
      </View>
      <View style={userStorage.nameRow}>
        <Text style={userStorage.name}>{item.name}</Text>
        {memberManager ? (
          <MaterialCommunityIcons
            name="crown"
            color={"#791111"}
            size={32}
            style={{ marginLeft: 10 }}
          />
        ) : null}
      </View>
      <PressableOpacity style={userStorage.icon} onPress={viewProfile}>
        <Entypo name="dots-three-horizontal" size={24} />
      </PressableOpacity>
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
  profileMini: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
});
