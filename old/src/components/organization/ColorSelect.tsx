import { View } from "react-native";
import ColorPicker, {
  Panel1,
  Swatches,
  HueSlider,
  OpacitySlider,
  InputWidget,
} from "reanimated-color-picker";
import { Hex } from "../../types/ModelTypes";
import { useColorSelect } from "../../styles/ColorSelectStyles";

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
  setColor: React.Dispatch<React.SetStateAction<Hex>>;
}) {
  const styles = useColorSelect();

  // triggered when a color is selected
  const onSelectColor = ({ hex }: { hex: string }) => {
    setColor(hex as Hex);
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
    <View style={styles.pickerContainer}>
      <ColorPicker
        style={styles.picker}
        value={color}
        onComplete={onSelectColor}
        boundedThumb
      >
        <View style={styles.panelView}>
          <Panel1 style={styles.panel} />
          <HueSlider style={styles.slider} vertical />
          <OpacitySlider style={styles.slider} vertical />
        </View>
        <View style={styles.widgetView}>
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
