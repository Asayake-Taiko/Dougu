import { GestureStateChangeEvent, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import { Dimensions } from "react-native";
import { useEquipment } from "../context/EquipmentContext";
import { Item } from "../../types/models";

const { width: windowWidth } = Dimensions.get("window");

export default function useSet({
  halfLine,
  topPage,
  bottomPage,
  listOne,
  listTwo,
  setDraggingItem,
  headerHeight,
  containerPage,
}: {
  halfLine: React.RefObject<number>;
  topPage: number;
  bottomPage: number;
  listOne: Item[];
  listTwo: Item[];
  setDraggingItem: (item: Item | null) => void;
  headerHeight: number;
  containerPage: number;
}) {
  const { selectedContainer: containerItem } = useEquipment();

  const handleSetItem = (e: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    const y = e.absoluteY;
    if (!halfLine.current) return;

    const isTop = y < halfLine.current + headerHeight;
    const startY = isTop ? 140 + headerHeight : halfLine.current + 60 + headerHeight;
    const endY = startY + windowWidth / 5;

    if (y < startY || y > endY) return;

    const page = isTop ? topPage : bottomPage;
    const offset = page * windowWidth;
    const list = isTop ? listOne : listTwo;
    const idx = Math.floor((e.absoluteX + offset) / (windowWidth / 4));

    if (idx >= 0 && idx < list.length) {
      setDraggingItem(list[idx]);
    }
  };

  const containerSetItem = (e: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
    if (!containerItem) return;

    const x = e.absoluteX;
    const y = e.absoluteY;

    // Based on ContainerOverlayStyles:
    // titleContainer: marginTop 80 + height 80 = 160
    // itemContainer: marginTop 5 = 165
    // itemPage: padding 10
    const containerTop = 165 + headerHeight;
    const padding = 10;
    const gridStartY = containerTop + padding;

    const containerWidth = 0.85 * windowWidth;
    const containerStartX = (windowWidth - containerWidth) / 2; // 0.075 * windowWidth
    const gridStartX = containerStartX + padding;

    const rowHeight = 130;
    const rowGap = 10;
    const colWidth = (containerWidth - 2 * padding) / 3;

    // Check if within grid bounds
    const gridWidth = containerWidth - 2 * padding;
    const gridHeight = 3 * rowHeight + 2 * rowGap;

    if (x < gridStartX || x > gridStartX + gridWidth || y < gridStartY || y > gridStartY + gridHeight) return;

    const row = Math.floor((y - gridStartY) / (rowHeight + rowGap));
    const col = Math.floor((x - gridStartX) / colWidth);

    // Boundary check for row/col (Math.floor can still be in gaps)
    if (row < 0 || row > 2 || col < 0 || col > 2) return;

    const idx = containerPage * 9 + row * 3 + col;

    if (idx >= 0 && idx < containerItem.equipment.length) {
      setDraggingItem(containerItem.equipment[idx]);
    }
  };

  return { handleSetItem, containerSetItem };
}
