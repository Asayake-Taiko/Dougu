import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native";

import CreateEquipmentScreen from "./CreateEquipmentScreen";
import ManageEquipmentScreen from "./ManageEquipmentScreen";
import SheetScreen from "./SheetScreen";
import CreateStorageScreen from "./CreateStorageScreen";
import InfoScreen from "./InfoScreen";
import ItemImageScreen from "./ItemImageScreen";
import { OrgStackParamList } from "../../types/NavigatorTypes";
import ItemImageProvider from "../../helper/context/ItemImageContext";
import { useEffect } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useHeader } from "../../helper/context/HeaderContext";
import OrgImageScreen from "./OrgImageScreen";
import UserStoragesScreen from "./UserStoragesScreen";
import MemberProfileScreen from "./MemberProfileScreen";
import DeleteOrgScreen from "./DeleteOrgScreen";

/*
    Stack navigator for the organization screens.
    It contains all the methods for managing an organization.
*/
export default function OrgStackNavigator() {
  // Create a stack navigator to handle navigation throughout the app
  const Stack = createNativeStackNavigator<OrgStackParamList>();
  const isFocused = useIsFocused();
  const { setOrgStackFocus } = useHeader();

  useEffect(() => {
    if (isFocused) {
      setOrgStackFocus(true);
    } else {
      setOrgStackFocus(false);
    }
  }, [isFocused, setOrgStackFocus]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ItemImageProvider>
        <Stack.Navigator
          screenOptions={{
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontSize: 18,
              fontWeight: "semibold",
            },
          }}
        >
          <Stack.Screen
            name="InfoScreen"
            component={InfoScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ManageEquipment"
            component={ManageEquipmentScreen}
          />
          <Stack.Screen
            name="CreateEquipment"
            component={CreateEquipmentScreen}
          />
          <Stack.Screen name="ItemImage" component={ItemImageScreen} />
          <Stack.Screen name="UserStorages" component={UserStoragesScreen} />
          <Stack.Screen name="CreateStorage" component={CreateStorageScreen} />
          <Stack.Screen name="Sheet" component={SheetScreen} />
          <Stack.Screen name="OrgImage" component={OrgImageScreen} />
          <Stack.Screen name="MemberProfile" component={MemberProfileScreen} />
          <Stack.Screen name="DeleteOrg" component={DeleteOrgScreen} />
        </Stack.Navigator>
      </ItemImageProvider>
    </SafeAreaView>
  );
}
