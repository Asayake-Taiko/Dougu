import { ImageSourcePropType } from "react-native";

import profileDefault from "../../assets/userprofiles/default.png";
import iconDefault from "../../assets/equipment/default.png";
import orgDefault from "../../assets/organization/default.png";
import defaultImage from "../../assets/default.png";

const profileMapping: { [key: string]: ImageSourcePropType } = new Proxy(
  { default_profile: profileDefault } as Record<string, ImageSourcePropType>,
  {
    get(target, prop: string) {
      return target[prop] ?? target.default_profile;
    },
  },
);

const iconMapping: { [key: string]: ImageSourcePropType } = new Proxy(
  { default_equipment: iconDefault } as Record<string, ImageSourcePropType>,
  {
    get(target, prop: string) {
      return target[prop] ?? target.default_equipment;
    },
  },
);

const orgMapping: { [key: string]: ImageSourcePropType } = new Proxy(
  { default_org: orgDefault } as Record<string, ImageSourcePropType>,
  {
    get(target, prop: string) {
      return target[prop] ?? target.default_org;
    },
  },
);

const allMappings: { [key: string]: ImageSourcePropType } = {
  default_profile: profileDefault,
  default_equipment: iconDefault,
  default_org: orgDefault,
  default_image: defaultImage,
};

export { iconMapping, profileMapping, orgMapping, allMappings };
