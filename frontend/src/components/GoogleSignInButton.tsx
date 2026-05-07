import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "../lib/supabase/supabase";
import { StyleSheet, View, Text, Image } from "react-native";
import { Layout, Spacing, Colors, Typography } from "../styles/global";
import { PressableOpacity } from "./PressableOpacity";
import GoogleIcon from "../assets/google.png";
import { Logger } from "../lib/utils/Logger";
import { useModal } from "../lib/context/ModalContext";
import { File, Paths } from "expo-file-system";
import { uploadImage } from "../lib/supabase/storage";
import { authService } from "../lib/services/auth";

export default function GoogleSignInButton() {
  const { setMessage } = useModal();
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  const handleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut(); // Force account selection by signing out first
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) return;
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });
      if (error) throw error;

      // Handle first-time Google signup profile picture upload
      const googlePhotoUrl = userInfo.data?.user.photo;

      // Determine if this is a brand new user by comparing creation and last sign-in timestamps
      const isNewUser =
        data.user &&
        data.user.last_sign_in_at &&
        new Date(data.user.last_sign_in_at).getTime() -
          new Date(data.user.created_at).getTime() <
          5000;

      if (isNewUser && googlePhotoUrl) {
        // Upload the Google photo if it's their very first time signing up.
        try {
          const file = new File(
            Paths.cache,
            `google_profile_${data.user.id}.png`,
          );
          const downloadedFile = await File.downloadFileAsync(
            googlePhotoUrl,
            file,
          );

          const finalImageKey = await uploadImage(
            downloadedFile.uri,
            `profiles/${data.user.id}/profile.png`,
          );

          await authService.updateProfile(finalImageKey, Colors.primary);
        } catch (uploadError: any) {
          Logger.error(
            "Failed to upload Google profile photo: " + uploadError.message,
          );
        }
      }
    } catch (error: any) {
      setMessage(error.message || "An error occurred");
      Logger.error(error.message);
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
