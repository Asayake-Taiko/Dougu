import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useModal } from "../../lib/context/ModalContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { InfoScreenProps } from "../../types/navigation";
import { useMembership } from "../../lib/context/MembershipContext";
import ImageEditingOverlay from "../../components/ImageEditingOverlay";
import EditImage from "../../components/EditImage";
import { ProfileStyles } from "../../styles/ProfileStyles";
import { PressableOpacity } from "../../components/PressableOpacity";
import { Colors } from "../../styles/global";

/*
  InfoScreen displays the organization's name, access code, and offers
  navigation to view more information about the organization's members,
  storages, and equipment.
*/
export default function OrgInfoScreen({ navigation }: InfoScreenProps) {
  const { organization, isManager } = useMembership();
  const { setMessage } = useModal();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [imageKey, setImageKey] = useState("default_org");
  const [color, setColor] = useState("#791111");

  useEffect(() => {
    if (organization) {
      setImageKey(organization.image);
      setColor(organization.color);
    }
  }, [organization]);

  const handleSave = async (newImageKey: string, newColor: string) => {
    try {
      if (!organization) return;
      if (!isManager)
        throw new Error("Only managers can edit organization profiles.");

      await organization.updateImage(newImageKey, newColor);
      setImageKey(newImageKey);
      setColor(newColor);
      setMessage("Organization updated successfully");
    } catch (error: any) {
      setMessage(error.message || "Failed to update organization");
    }
  };

  return (
    <View style={ProfileStyles.container}>
      <EditImage
        imageKey={imageKey}
        color={color}
        onPress={() => setOverlayVisible(true)}
      />

      <View style={ProfileStyles.row}>
        <Text style={ProfileStyles.text}>Name</Text>
        <View style={ProfileStyles.changeBtn}>
          <Text style={ProfileStyles.text}>{organization?.name}</Text>
        </View>
      </View>

      <View style={ProfileStyles.row}>
        <Text style={ProfileStyles.text}>Access Code</Text>
        <View style={ProfileStyles.changeBtn}>
          <Text style={ProfileStyles.text}>{organization?.accessCode}</Text>
        </View>
      </View>

      <PressableOpacity
        style={ProfileStyles.row}
        onPress={() => navigation.navigate("UserStorages")}
      >
        <Text style={ProfileStyles.text}>Members</Text>
        <View style={ProfileStyles.changeBtn}>
          <MaterialCommunityIcons name="chevron-right" size={30} />
        </View>
      </PressableOpacity>

      <PressableOpacity
        style={ProfileStyles.row}
        onPress={() => navigation.navigate("Sheet")}
      >
        <Text style={ProfileStyles.text}>Equipment Sheet</Text>
        <View style={ProfileStyles.changeBtn}>
          <MaterialCommunityIcons name="chevron-right" size={30} />
        </View>
      </PressableOpacity>

      <PressableOpacity
        style={ProfileStyles.row}
        onPress={() => navigation.navigate("ManageEquipment")}
      >
        <Text style={ProfileStyles.text}>Manage Equipment</Text>
        <View style={ProfileStyles.changeBtn}>
          <MaterialCommunityIcons name="chevron-right" size={30} />
        </View>
      </PressableOpacity>

      <PressableOpacity
        style={ProfileStyles.row}
        onPress={() => navigation.navigate("DeleteOrg")}
      >
        <Text style={[ProfileStyles.text, { color: Colors.primary }]}>
          Delete Organization
        </Text>
        <View style={ProfileStyles.changeBtn}>
          <MaterialCommunityIcons name="chevron-right" size={30} />
        </View>
      </PressableOpacity>

      <ImageEditingOverlay
        visible={overlayVisible}
        setVisible={setOverlayVisible}
        currentImageKey={imageKey}
        currentColor={color}
        onSave={handleSave}
      />
    </View>
  );
}
