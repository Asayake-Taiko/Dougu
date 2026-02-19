import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "../lib/supabase/supabase";
import { StyleSheet, View, Text, Image } from "react-native";
import { Layout, Spacing, Colors, Typography } from "../styles/global";
import { PressableOpacity } from "./PressableOpacity";
import GoogleIcon from "../assets/google.png";

export default function GoogleSignInButton() {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    // androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  const handleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        throw new Error("No ID token present!");
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) {
        console.error("Supabase Auth Error", error);
      } else {
        console.log("Signed in with Google!", data);
      }
    } catch (error: any) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error?.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
        console.error("Google Sign In Error", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <PressableOpacity style={styles.googleButton} onPress={handleSignIn}>
        <View style={styles.iconContainer}>
          <Image source={GoogleIcon} style={styles.googleIcon} />
        </View>
        <Text style={styles.googleButtonText}>Sign in with Google</Text>
      </PressableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    alignItems: "center",
    width: "100%",
  },
  googleButton: {
    height: Layout.dimensions.buttonHeight,
    backgroundColor: Colors.gray100,
    width: "80%",
    borderRadius: Layout.borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  iconContainer: {
    backgroundColor: Colors.white,
    padding: 8,
    borderRadius: Layout.borderRadius.sm,
    marginRight: Spacing.md,
  },
  googleIcon: {
    width: 18,
    height: 18,
  },
  googleButtonText: {
    fontWeight: Typography.fontWeight[600],
    color: Colors.black,
    fontSize: Typography.fontSize.md,
    flex: 1,
    textAlign: "center",
  },
});
