import { useRef } from "react";
import { GestureStateChangeEvent, PanGestureHandlerEventPayload } from "react-native-gesture-handler";
import { Dimensions } from "react-native";
import { useEquipment } from "../context/EquipmentContext";
import { Item } from "../../types/models";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

export default function useSet({
  halfLine,
  topPage,
  bottomPage,
  listOne,
  listTwo,
  setDraggingItem,
  headerHeight,
}: {
  halfLine: React.RefObject<number>;
  topPage: number;
  bottomPage: number;
  listOne: Item[];
  listTwo: Item[];
  setDraggingItem: (item: Item | null) => void;
  headerHeight: number;
}) {
  const { selectedContainer: containerItem, containerPage } = useEquipment();

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

    const startX = 0.075 * windowWidth;
    const endX = 0.925 * windowWidth;
    const startY = 0.2 * windowHeight;
    const endY = 0.7 * windowHeight + 30;

    if (x < startX || x > endX || y < startY || y > endY) return;

    const row = Math.floor((y - startY) / (0.18 * windowHeight));
    const col = Math.floor((x - startX) / ((windowWidth * 0.85) / 3));
    const idx = containerPage * 9 + row * 3 + col;

    if (idx >= 0 && idx < containerItem.equipment.length) {
      setDraggingItem(containerItem.equipment[idx]);
    }
  };

  return { handleSetItem, containerSetItem };
}
