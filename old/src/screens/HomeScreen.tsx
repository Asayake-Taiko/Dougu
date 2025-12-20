import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";

// Project Files
import { useUser } from "../helper/context/UserContext";
import LoginScreen from "../components/Login";
import CreateAccScreen from "../components/CreateAcc";
import { HomeScreenProps } from "../types/ScreenTypes";
import { useLoad } from "../helper/context/LoadingContext";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* 
  HomeScreen is the first screen that the user sees when they open the app. 
  It allows the user to login or create an account. 
*/
export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [login, setLogin] = React.useState(true);
  const { setUser } = useUser();
  const { setIsLoading } = useLoad();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    // Checks if a user is currently logged in. If so, navigates to the MemberTabs screen
    const checkCurrentUser = async () => {
      try {
        const { username } = await getCurrentUser();
        const userString = await AsyncStorage.getItem("user");
        const user = userString ? JSON.parse(userString) : null;
        if (user && username && username === user.id) {
          setUser(user);
          navigation.navigate("DrawerNav", { screen: "MyOrgs" });
        } else console.log("User is not logged in");
      } catch {
        console.log("No user is logged in");
      }
    };

    checkCurrentUser();
  }, [navigation, setIsLoading, setUser]);

  useEffect(() => {
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
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {!isKeyboardVisible && <Text style={styles.title}>Dougu</Text>}
      <View style={styles.loginCreateContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setLogin(true)}>
            <Text>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLogin(false)}>
            <Text>Create</Text>
          </TouchableOpacity>
        </View>
        {login ? (
          <LoginScreen navigation={navigation} />
        ) : (
          <CreateAccScreen navigation={navigation} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    width: "100%",
  },
  title: {
    marginTop: "10%",
    fontSize: 40,
    fontWeight: "bold",
    color: "#791111",
  },
  loginCreateContainer: {
    width: "80%",
    borderWidth: 1,
    borderRadius: 20,
    marginTop: "10%",
  },
  header: {
    height: "10%",
    width: "100%",
    borderWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});
