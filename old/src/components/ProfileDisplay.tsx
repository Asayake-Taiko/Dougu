import { ImageSourcePropType } from "react-native";
import { Image } from "expo-image";
import { profileMapping } from "../helper/ImageMapping";
import { useEffect, useState } from "react";
import { getImageUri } from "../helper/AWS";
import { useDisplaytyles } from "../styles/Display";

/*
  ProfileDisplay displays the profile image of a user. It can either
  use a stored image uri or fetch the image from AWS S3.
*/
export default function ProfileDisplay({
  isMini,
  profileKey,
  source,
  userId,
}: {
  isMini: boolean;
  profileKey: string;
  source: ImageSourcePropType | null;
  userId: string | null | undefined;
}) {
  const [profileSource, setProfileSource] = useState<ImageSourcePropType>(
    profileMapping["default"],
  );
  const displayStyles = useDisplaytyles();
  const styles = isMini ? displayStyles.profileMini : displayStyles.profile;

  useEffect(() => {
    const checkCache = async () => {
      const path = await Image.getCachePathAsync(profileKey);
      if (path) {
        setProfileSource({ uri: path });
      } else {
        const fetchPath = `public/profiles/${userId}/profile.jpeg`;
        const fetchImageUri = await getImageUri(fetchPath);
        if (fetchImageUri) setProfileSource({ uri: fetchImageUri });
        else setProfileSource(profileMapping["default"]);
      }
    };

    if (source) {
      setProfileSource(source);
    } else if (profileKey in profileMapping) {
      setProfileSource(profileMapping[profileKey]);
    } else {
      checkCache();
    }
  }, [profileKey, source, userId]);

  return (
    <Image
      source={
        typeof profileSource === "object" && "uri" in profileSource
          ? { uri: profileSource.uri, cacheKey: profileKey }
          : profileSource
      }
      style={styles}
    />
  );
}
