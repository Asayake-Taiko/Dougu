import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useAuth } from "../../lib/context/AuthContext";
import { useProfile } from "../../lib/context/ProfileContext";
import { ProfileStyles } from "../../styles/ProfileStyles";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import ImageEditingOverlay from "../../components/ImageEditingOverlay";
import NameOverlay from "../../components/drawer/NameOverlay";
import EmailOverlay from "../../components/drawer/EmailOverlay";
import PasswordOverlay from "../../components/drawer/PasswordOverlay";
import DeleteOverlay from "../../components/drawer/DeleteOverlay";
import { PressableOpacity } from "../../components/PressableOpacity";
import { useModal } from "../../lib/context/ModalContext";
import { useSpinner } from "../../lib/context/SpinnerContext";
import { Logger } from "../../lib/utils/Logger";
import { authService } from "../../lib/services/auth";
import EditImage from "../../components/EditImage";
import { uploadImage } from "../../lib/supabase/storage";
import { clearAllData } from "../../lib/powersync/PowerSync";

export default function ProfileScreen() {
  const { session } = useAuth();
  const { profile } = useProfile();

  const [profileImage, setProfileImage] = useState("default_profile");
  const [profileColor, setProfileColor] = useState("#791111");
  const [profileVisible, setProfileVisible] = useState(false);
  const [nameVisible, setNameVisible] = useState(false);
  const [emailVisible, setEmailVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const { setMessage } = useModal();
  const { showSpinner, hideSpinner } = useSpinner();

  useEffect(() => {
    if (profile) {
      setProfileImage(profile.profileImage || "default_profile");
      setProfileColor(profile.color || "#791111");
    }
  }, [profile]);

  async function handleLogout() {
    try {
      showSpinner();
      await authService.logout();
    } catch (error) {
      console.log("test");
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Logout failed");
      }
      Logger.error(error);
    } finally {
      hideSpinner();
    }
  }

  const handleSave = async (newImageKey: string, newColor: string) => {
    try {
      showSpinner();
      let finalImageKey = newImageKey;

      if (newImageKey.startsWith("file://")) {
        if (!session?.user.id) throw new Error("User ID not found");
        finalImageKey = await uploadImage(
          newImageKey,
          `profiles/${session.user.id}/profile.png`,
        );
      }

      await authService.updateProfile(finalImageKey, newColor);
      setMessage("Profile updated successfully");
    } catch (error: any) {
      setMessage(error.message || "Failed to update profile");
      Logger.error(error);
    } finally {
      hideSpinner();
    }
  };

  return (
    <View style={ProfileStyles.container}>
      <EditImage
        imageKey={profileImage}
        color={profileColor}
        onPress={() => setProfileVisible(true)}
      />
      <PressableOpacity
        style={ProfileStyles.row}
        onPress={() => setNameVisible(true)}
      >
        <Text style={ProfileStyles.text}>Name</Text>
        <View style={ProfileStyles.changeBtn}>
          <Text style={ProfileStyles.text}>{profile?.name}</Text>
          <MaterialCommunityIcons name="chevron-right" size={30} />
        </View>
      </PressableOpacity>
      <PressableOpacity
        style={ProfileStyles.row}
        onPress={() => setEmailVisible(true)}
      >
        <Text style={ProfileStyles.text}>Email</Text>
        <View style={ProfileStyles.changeBtn}>
          <Text style={ProfileStyles.text}>{session?.user.email}</Text>
          <MaterialCommunityIcons name="chevron-right" size={30} />
        </View>
      </PressableOpacity>
      <PressableOpacity
        style={ProfileStyles.row}
        onPress={() => setPasswordVisible(true)}
      >
        <Text style={ProfileStyles.text}>Change Password</Text>
        <View style={ProfileStyles.changeBtn}>
          <MaterialCommunityIcons name="chevron-right" size={30} />
        </View>
      </PressableOpacity>
      <PressableOpacity
        style={ProfileStyles.row}
        onPress={() => setDeleteVisible(true)}
      >
        <Text style={ProfileStyles.text}>Delete Account</Text>
        <View style={ProfileStyles.changeBtn}>
          <MaterialCommunityIcons name="chevron-right" size={30} />
        </View>
      </PressableOpacity>
      {__DEV__ && (
        <PressableOpacity
          style={ProfileStyles.row}
          onPress={async () => {
            try {
              showSpinner();
              await clearAllData();
              setMessage("Local database cleared. Please restart the app.");
            } catch (error) {
              Logger.error(error);
              setMessage("Failed to clear local database");
            } finally {
              hideSpinner();
            }
          }}
        >
          <Text style={ProfileStyles.text}>[DEV] Clear Local DB</Text>
          <View style={ProfileStyles.changeBtn}>
            <MaterialCommunityIcons name="database-remove" size={30} />
          </View>
        </PressableOpacity>
      )}
      <PressableOpacity style={ProfileStyles.row} onPress={handleLogout}>
        <Text style={ProfileStyles.text}>Logout</Text>
        <View style={ProfileStyles.changeBtn}>
          <MaterialCommunityIcons name="chevron-right" size={30} />
        </View>
      </PressableOpacity>
      <ImageEditingOverlay
        visible={profileVisible}
        setVisible={setProfileVisible}
        currentImageKey={profileImage}
        currentColor={profileColor}
        onSave={handleSave}
      />
      <NameOverlay visible={nameVisible} setVisible={setNameVisible} />
      <PasswordOverlay
        visible={passwordVisible}
        setVisible={setPasswordVisible}
      />
      <EmailOverlay visible={emailVisible} setVisible={setEmailVisible} />
      <DeleteOverlay visible={deleteVisible} setVisible={setDeleteVisible} />
    </View>
  );
}
