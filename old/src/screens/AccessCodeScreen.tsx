import { Text, View, TouchableOpacity } from "react-native";
import React from "react";

import { createJoinStyles } from "../styles/CreateJoinStyles";
import { AccessCodeScreenProps } from "../types/ScreenTypes";

/*
  Screen for displaying the access code to the manager after they create an organization
*/
export default function AccessCodeScreen({
  route,
  navigation,
}: AccessCodeScreenProps) {
  const { accessCode } = route.params;

  return (
    <View style={createJoinStyles.mainContainer}>
      <View style={createJoinStyles.container}>
        <Text style={createJoinStyles.title}>Access Code!</Text>
        <Text style={createJoinStyles.accessCode}>{accessCode}</Text>
        <Text style={createJoinStyles.subtitle}>
          Give this code to your members so they can join your organization!
          (You will still be able to see this code in the OrgInfo tab)
        </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("DrawerNav", {
              screen: "MemberTabs",
              params: {
                screen: "Equipment",
              },
            })
          }
          style={createJoinStyles.button}
        >
          <Text style={createJoinStyles.btnText}>Start Managing!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
