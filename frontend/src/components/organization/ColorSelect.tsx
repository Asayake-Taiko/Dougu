import { scheduleOnRN } from "react-native-worklets";
import { View } from "react-native";
import ColorPicker, {
  Panel1,
  Swatches,
  HueSlider,
  OpacitySlider,
  InputWidget,
} from "reanimated-color-picker";
import { Hex } from "../../types/other";
import { ColorSelectStyles } from "../../styles/ColorSelectStyles";

/*
  ColorSelect allows the user to select a background color for
  equipment and containers. It is shown in the ItemImageScreen
  component.
*/
export default function ColorSelect({
  color,
  setColor,
}: {
  color: Hex;
  setColor: (color: Hex) => void;
}) {
  // triggered when a color is selected
  const onSelectColor = ({ hex }: { hex: string }) => {
    "worklet";
    if (hex) {
      scheduleOnRN(setColor, hex as Hex);
    }
  };

  // color palette for the user to choose from
  const colorPalette = [
    "#f27474",
    "#ebc287",
    "#acde72",
    "#a4e3ff",
    "#99a3d7",
    "#c587d0",
    "#c3a07e",
  ];

  return (
    <View style={ColorSelectStyles.pickerContainer}>
      <ColorPicker
        style={ColorSelectStyles.picker}
        value={color}
        onComplete={onSelectColor}
        boundedThumb
      >
        <View style={ColorSelectStyles.panelView}>
          <Panel1 style={ColorSelectStyles.panel} />
          <HueSlider style={ColorSelectStyles.slider} vertical />
          <OpacitySlider style={ColorSelectStyles.slider} vertical />
        </View>
        <View style={ColorSelectStyles.widgetView}>
          <InputWidget
            inputTitleStyle={{ display: "none" }}
            containerStyle={{ backgroundColor: "white" }}
            formats={["HEX"]}
          />
          <Swatches colors={colorPalette} />
        </View>
      </ColorPicker>
    </View>
  );
}
