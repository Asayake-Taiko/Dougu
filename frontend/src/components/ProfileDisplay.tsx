import { Image } from "expo-image";
import { profileMapping } from "../lib/ImageMapping";
import { DisplayStyles } from "../styles/Display";

/*
  ProfileDisplay displays the profile image of a user. It can either
  use a stored image uri or fetch the image from AWS S3.
*/
export default function ProfileDisplay({
  isMini,
  profileKey,
}: {
  isMini: boolean;
  profileKey: string | undefined;
}) {
  const styles = isMini ? DisplayStyles.profileMini : DisplayStyles.profile;

  return (
    <Image
      source={profileKey ? profileMapping[profileKey] : profileMapping["default"]}
      style={styles}
    />
  );
}
