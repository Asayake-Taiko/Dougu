import { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useAuth } from "../../lib/context/AuthContext";
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

export default function ProfileScreen() {
  const { session, profile } = useAuth();

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
      await authService.updateProfile(newImageKey, newColor);
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
        type="User"
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
