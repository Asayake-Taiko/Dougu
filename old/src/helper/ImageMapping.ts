import { ImageSourcePropType } from "react-native";

const profilePath = "../assets/userprofiles/";

const profileMapping: { [key: string]: ImageSourcePropType } = {
  miku: require(`${profilePath}miku.png`),
  zote: require(`${profilePath}zote.png`),
  jiji: require(`${profilePath}jiji.png`),
  sadaharu: require(`${profilePath}sadaharu.png`),
  pikachu: require(`${profilePath}pikachu.png`),
  kai: require(`${profilePath}kai.png`),
  saitama: require(`${profilePath}saitama.png`),
  redTaiko: require(`${profilePath}redTaiko.png`),
  blueTaiko: require(`${profilePath}blueTaiko.png`),
  default: require(`${profilePath}default.png`),
};

const equipmentPath = "../assets/equipment/";
const drums: { [key: string]: ImageSourcePropType } = {
  chu: require(`${equipmentPath}chu.png`),
  shime: require(`${equipmentPath}shime.png`),
  okedo: require(`${equipmentPath}okedo.png`),
  ohira: require(`${equipmentPath}ohira.png`),
  odaiko: require(`${equipmentPath}odaiko.png`),
  tire: require(`${equipmentPath}tire.png`),
};

const stands: { [key: string]: ImageSourcePropType } = {
  nanameStand: require(`${equipmentPath}nanameStand.png`),
  betaStand: require(`${equipmentPath}betaStand.png`),
  shimeStand: require(`${equipmentPath}shimeStand.png`),
  hachijoStand: require(`${equipmentPath}hachijoStand.png`),
  okedoStand: require(`${equipmentPath}okedoStand.png`),
  odaikoStand: require(`${equipmentPath}odaikoStand.png`),
  yataiStand: require(`${equipmentPath}yataiStand.png`),
  chair: require(`${equipmentPath}chair.png`),
};

const clothing: { [key: string]: ImageSourcePropType } = {
  happi: require(`${equipmentPath}happi.png`),
  haori: require(`${equipmentPath}haori.png`),
  hakama: require(`${equipmentPath}hakama.png`),
  hachimakiBlack: require(`${equipmentPath}hachimakiBlack.png`),
  hachimakiWhite: require(`${equipmentPath}hachimakiWhite.png`),
};

const other: { [key: string]: ImageSourcePropType } = {
  mallet: require(`${equipmentPath}mallet.png`),
  chappa: require(`${equipmentPath}chappa.png`),
  clave: require(`${equipmentPath}clave.png`),
  kane: require(`${equipmentPath}kane.png`),
  bachi: require(`${equipmentPath}bachi.png`),
  batBachi: require(`${equipmentPath}batBachi.png`),
  bells: require(`${equipmentPath}bells.png`),
};

const taiko: { [key: string]: ImageSourcePropType } = {
  ...drums,
  ...stands,
  ...clothing,
  ...other,
};

const iconMapping: { [key: string]: ImageSourcePropType } = {
  ...taiko,
  default: require(`${equipmentPath}default.png`),
};

const orgMapping: { [key: string]: ImageSourcePropType } = {
  default: require("../assets/asayake.png"),
};

export { iconMapping, profileMapping, orgMapping };
