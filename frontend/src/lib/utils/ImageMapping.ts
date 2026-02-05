import { ImageSourcePropType } from "react-native";

import miku from "../../assets/userprofiles/miku.png";
import zote from "../../assets/userprofiles/zote.png";
import jiji from "../../assets/userprofiles/jiji.png";
import sadaharu from "../../assets/userprofiles/sadaharu.png";
import pikachu from "../../assets/userprofiles/pikachu.png";
import kai from "../../assets/userprofiles/kai.png";
import saitama from "../../assets/userprofiles/saitama.png";
import redTaiko from "../../assets/userprofiles/redTaiko.png";
import blueTaiko from "../../assets/userprofiles/blueTaiko.png";
import profileDefault from "../../assets/userprofiles/default.png";

import chu from "../../assets/equipment/chu.png";
import shime from "../../assets/equipment/shime.png";
import okedo from "../../assets/equipment/okedo.png";
import ohira from "../../assets/equipment/ohira.png";
import odaiko from "../../assets/equipment/odaiko.png";
import tire from "../../assets/equipment/tire.png";

import nanameStand from "../../assets/equipment/nanameStand.png";
import betaStand from "../../assets/equipment/betaStand.png";
import shimeStand from "../../assets/equipment/shimeStand.png";
import hachijoStand from "../../assets/equipment/hachijoStand.png";
import okedoStand from "../../assets/equipment/okedoStand.png";
import odaikoStand from "../../assets/equipment/odaikoStand.png";
import yataiStand from "../../assets/equipment/yataiStand.png";
import chair from "../../assets/equipment/chair.png";

import happi from "../../assets/equipment/happi.png";
import haori from "../../assets/equipment/haori.png";
import hakama from "../../assets/equipment/hakama.png";
import hachimakiBlack from "../../assets/equipment/hachimakiBlack.png";
import hachimakiWhite from "../../assets/equipment/hachimakiWhite.png";

import mallet from "../../assets/equipment/mallet.png";
import chappa from "../../assets/equipment/chappa.png";
import clave from "../../assets/equipment/clave.png";
import kane from "../../assets/equipment/kane.png";
import bachi from "../../assets/equipment/bachi.png";
import batBachi from "../../assets/equipment/batBachi.png";
import bells from "../../assets/equipment/bells.png";
import iconDefault from "../../assets/equipment/default.png";

import orgDefault from "../../assets/organization/default.png";
import asayake from "../../assets/organization/asayake.png";

import defaultImage from "../../assets/default.png";

const baseProfileMapping: { [key: string]: ImageSourcePropType } = {
  miku,
  zote,
  jiji,
  sadaharu,
  pikachu,
  kai,
  saitama,
  redTaiko,
  blueTaiko,
  default_profile: profileDefault,
};

const profileMapping: { [key: string]: ImageSourcePropType } = new Proxy(
  baseProfileMapping,
  {
    get(target, prop: string) {
      return target[prop] ?? target.default_profile;
    },
  },
);

const drums: { [key: string]: ImageSourcePropType } = {
  chu,
  shime,
  okedo,
  ohira,
  odaiko,
  tire,
};

const stands: { [key: string]: ImageSourcePropType } = {
  nanameStand,
  betaStand,
  shimeStand,
  hachijoStand,
  okedoStand,
  odaikoStand,
  yataiStand,
  chair,
};

const clothing: { [key: string]: ImageSourcePropType } = {
  happi,
  haori,
  hakama,
  hachimakiBlack,
  hachimakiWhite,
};

const other: { [key: string]: ImageSourcePropType } = {
  mallet,
  chappa,
  clave,
  kane,
  bachi,
  batBachi,
  bells,
};

const taiko: { [key: string]: ImageSourcePropType } = {
  ...drums,
  ...stands,
  ...clothing,
  ...other,
};

const baseIconMapping: { [key: string]: ImageSourcePropType } = {
  ...taiko,
  default_equipment: iconDefault,
};

const iconMapping: { [key: string]: ImageSourcePropType } = new Proxy(
  baseIconMapping,
  {
    get(target, prop: string) {
      return target[prop] ?? target.default_equipment;
    },
  },
);

const baseOrgMapping: { [key: string]: ImageSourcePropType } = {
  default_org: orgDefault,
  asayake,
};

const orgMapping: { [key: string]: ImageSourcePropType } = new Proxy(
  baseOrgMapping,
  {
    get(target, prop: string) {
      return target[prop] ?? target.default_org;
    },
  },
);

const allMappings: { [key: string]: ImageSourcePropType } = {
  ...iconMapping,
  ...profileMapping,
  ...orgMapping,
  default_image: defaultImage,
};

export {
  iconMapping,
  profileMapping,
  orgMapping,
  allMappings,
  baseProfileMapping,
  baseOrgMapping,
};
