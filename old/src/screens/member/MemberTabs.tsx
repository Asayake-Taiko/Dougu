import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import React, { useEffect, useState, useLayoutEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import FontAwesone5 from "react-native-vector-icons/FontAwesome5";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Alert, Keyboard } from "react-native";

// project imports
import EquipmentScreen from "./EquipmentScreen";
import SwapEquipmentScreen from "./SwapEquipmentScreen";
import TeamEquipmentScreen from "./TeamEquipmentScreen";
import { useUser } from "../../helper/context/UserContext";
import { MemberTabsScreenProps } from "../../types/ScreenTypes";
import SpinningIndicator from "../../components/SpinningIndicator";
import { TabParamList } from "../../types/NavigatorTypes";
import OrgStackNavigator from "../organization/OrgStackNavigator";
import { callSignOut } from "../../helper/Utils";
import { useLoad } from "../../helper/context/LoadingContext";
import EquipmentOverlay from "../../components/member/EquipmentOverlay";
import EquipmentProvider from "../../helper/context/EquipmentContext";
import ContainerOverlay from "../../components/member/ContainerOverlay";

// The navigator for a logged in member of an organization
const Tab = createMaterialTopTabNavigator<TabParamList>();

/*
  MemberTabs is the tab navigator for a user. It holds all the screens
  that a user can navigate to while they are a member of an organization.
*/
export default function MemberTabs({ navigation }: MemberTabsScreenProps) {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const isFocused = useIsFocused();
  const { user, org, orgUserStorage, isManager, contextLoading, resetContext } =
    useUser();
  const { setIsLoading } = useLoad();

  // set the header title and right icon, a crown is shown if the user is the manager
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: org!.name,
      headerRight: () => {
        if (isManager) {
          return (
            <MaterialCommunityIcons
              name="crown"
              color={"#791111"}
              size={35}
              style={{ padding: 5 }}
            />
          );
        } else return null;
      },
    });
  }, [isManager, navigation, org]);

  // listen for keyboard events and hide the tab bar when the keyboard is visible
  useLayoutEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // verify that the user, org, and orgUserStorage are not null
  // (all screens in the tab navigator require these values)
  useEffect(() => {
    const checkUserOrg = async () => {
      if (!contextLoading && (!user || !org || !orgUserStorage)) {
        Alert.alert("Error", "User, org, or orgUserStorage is null.");
        await callSignOut(setIsLoading, navigation, resetContext);
        return;
      }
    };

    if (isFocused) checkUserOrg();
  }, [
    contextLoading,
    isFocused,
    navigation,
    org,
    orgUserStorage,
    resetContext,
    setIsLoading,
    user,
  ]);

  if (contextLoading) {
    return <SpinningIndicator />;
  }

  return (
    <EquipmentProvider>
      <Tab.Navigator
        tabBarPosition="bottom"
        initialRouteName="OrgInfo"
        screenOptions={{
          tabBarLabelStyle: {
            fontSize: 9,
          },
          tabBarStyle: {
            height: keyboardVisible ? 0 : 70,
            paddingTop: keyboardVisible ? 0 : 5,
          },
          tabBarIconStyle: {
            marginTop: -5,
          },
          tabBarShowIcon: true,
          swipeEnabled: false,
        }}
      >
        <Tab.Screen
          name="Equipment"
          component={EquipmentScreen}
          options={{
            tabBarIcon: () => (
              <FontAwesone5 name="home" color={"black"} size={20} />
            ),
          }}
        />
        <Tab.Screen
          name="Swap"
          component={SwapEquipmentScreen}
          options={{
            tabBarIcon: () => <Entypo name="cycle" color={"black"} size={20} />,
          }}
        />
        <Tab.Screen
          name="Team"
          component={TeamEquipmentScreen}
          options={{
            tabBarIcon: () => (
              <FontAwesone5 name="users" color={"black"} size={19} />
            ),
          }}
        />
        <Tab.Screen
          name="OrgInfo"
          component={OrgStackNavigator}
          options={{
            tabBarIcon: () => (
              <MaterialCommunityIcons name="crown" color={"black"} size={21} />
            ),
          }}
        />
      </Tab.Navigator>
      <ContainerOverlay />
      <EquipmentOverlay />
    </EquipmentProvider>
  );
}
