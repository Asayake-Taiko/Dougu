import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { useState } from "react";
import UploadImage from "../../components/UploadImage";
import { Button } from "@rneui/themed";
import { useUser } from "../../helper/context/UserContext";
import { useLoad } from "../../helper/context/LoadingContext";
import { uploadImage } from "../../helper/AWS";
import { handleError } from "../../helper/Utils";
import OrgImageDisplay from "../../components/organization/OrgImageDisplay";
import { editOrgImage } from "../../helper/EditUtils";

export default function OrgImageScreen() {
  const { org, setOrg } = useUser();
  const { setIsLoading } = useLoad();
  const [imageUri, setImageUri] = useState<ImageSourcePropType | null>(null);
  const [imageKey, setImageKey] = useState<string>(org!.image);

  const handleUpload = async () => {
    // upload the image to AWS S3
    try {
      if (imageUri) {
        setIsLoading(true);
        const path = `public/${org!.id}/orgImage.jpeg`;
        // upload the image to S3
        await uploadImage(imageUri, path);
        // update datastore and our local context
        const newOrg = await editOrgImage(org!.id, imageKey);
        setOrg(newOrg);
        setIsLoading(false);
      }
    } catch (error) {
      handleError("handleUpload", error as Error, setIsLoading);
    }
  };

  return (
    <View style={styles.container}>
      <OrgImageDisplay
        orgId={org!.id}
        imageKey={imageKey}
        imageSource={imageUri}
      />
      <View style={styles.uploadContainer}>
        <UploadImage setImageSource={setImageUri} setImageKey={setImageKey} />
      </View>
      <Button
        buttonStyle={styles.button}
        containerStyle={styles.buttonContainer}
        icon={{ name: "upload", type: "antdesign", color: "white", size: 30 }}
        onPress={handleUpload}
        title="Upload"
        titleStyle={{ fontWeight: "500" }}
        radius={"md"}
        size="lg"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#791111",
  },
  buttonContainer: {
    width: "80%",
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 20,
  },
  uploadContainer: {
    width: "90%",
    minHeight: "50%",
    borderRadius: 20,
  },
});
