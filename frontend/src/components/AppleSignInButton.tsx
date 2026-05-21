import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "../lib/supabase/supabase";
import { StyleSheet, View, Text } from "react-native";
import { Layout, Spacing, Colors, Typography } from "../styles/global";
import { PressableOpacity } from "./PressableOpacity";
import { Logger } from "../lib/utils/Logger";
import { useModal } from "../lib/context/ModalContext";
import { authService } from "../lib/services/auth";
import { Ionicons } from "@expo/vector-icons";

export default function AppleSignInButton() {
  const { setMessage } = useModal();

  const handleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const idToken = credential.identityToken;
      if (!idToken) {
        throw new Error("No identityToken received from Apple");
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: idToken,
      });
      if (error) throw error;

      // Construct name from Apple credentials
      let name = "";
      if (credential.fullName) {
        const parts = [];
        if (credential.fullName.givenName) {
          parts.push(credential.fullName.givenName);
        }
        if (credential.fullName.familyName) {
          parts.push(credential.fullName.familyName);
        }
        name = parts.join(" ").trim();
      }

      // Determine if this is a brand new user by comparing creation and last sign-in timestamps
      const isNewUser =
        data.user &&
        data.user.last_sign_in_at &&
        new Date(data.user.last_sign_in_at).getTime() -
          new Date(data.user.created_at).getTime() <
          5000;

      if (isNewUser && name) {
        try {
          await authService.updateName(name);
        } catch (nameError: any) {
          Logger.error(
            "Failed to update profile name from Apple sign-in: " +
              nameError.message,
          );
        }
      }
    } catch (error: any) {
      // Don't show modal if user canceled the sign-in prompt
      if (error.code !== "ERR_REQUEST_CANCELED") {
        setMessage(error.message || "An error occurred during Apple Sign-In");
        Logger.error(error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <PressableOpacity style={styles.appleButton} onPress={handleSignIn}>
        <View style={styles.iconContainer}>
          <Ionicons name="logo-apple" size={18} color={Colors.white} />
        </View>
        <Text style={styles.appleButtonText}>Sign in with Apple</Text>
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
  appleButton: {
    height: Layout.dimensions.buttonHeight,
    backgroundColor: Colors.black,
    width: "80%",
    borderRadius: Layout.borderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },
  iconContainer: {
    padding: 8,
    borderRadius: Layout.borderRadius.sm,
    marginRight: Spacing.md,
  },
  appleButtonText: {
    fontWeight: Typography.fontWeight[600],
    color: Colors.white,
    fontSize: Typography.fontSize.md,
    flex: 1,
    textAlign: "center",
  },
});
