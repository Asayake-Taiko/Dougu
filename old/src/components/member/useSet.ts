import { useState } from "react";
import {
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";

import { useEquipment } from "../../helper/context/EquipmentContext";
import { ItemObj } from "../../types/ModelTypes";

export default function useSet({
  windowWidth,
  windowHeight,
  halfLine,
  topPage,
  bottomPage,
  listOne,
  listTwo,
}: {
  windowWidth: number;
  windowHeight: number;
  halfLine: React.MutableRefObject<number>;
  topPage: number;
  bottomPage: number;
  listOne: ItemObj[];
  listTwo: ItemObj[];
}) {
  const [draggingItem, setDraggingItem] = useState<ItemObj | null>(null);
  const { containerItem } = useEquipment();
  const [containerPage, setContainerPage] = useState(0);
  // calculate the range of the container overlay
  const offset = windowWidth / 4;
  const equipmentWidth = windowWidth / 5;
  const containerYRange = {
    start: 0.2 * windowHeight,
    end: 0.7 * windowHeight + 30,
  };
  const containerXRange = {
    start: 0.075 * windowWidth,
    end: 0.925 * windowWidth,
  };
  const topYRange = {
    start: 140,
    end: 140 + equipmentWidth,
  };
  const bottomYRange = {
    start: halfLine.current + 60,
    end: halfLine.current + 60 + equipmentWidth,
  };

  const containerSetItem = (
    gesture: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => {
    if (!containerItem) return;
    const x = gesture.x;
    const y = gesture.y;
    // ensure the user is within the container overlay
    if (x < containerXRange.start || x > containerXRange.end) return;
    if (y < containerYRange.start || y > containerYRange.end) return;
    const row = Math.floor((y - containerYRange.start) / (0.18 * windowHeight));
    const col = Math.floor(
      (x - containerXRange.start) / ((windowWidth * 0.85) / 3),
    );
    const idx = containerPage * 9 + row * 3 + col;
    if (idx < 0 || idx > containerItem.equipment.length - 1) return;
    const item = containerItem.equipment[idx];
    item.count -= 1;
    setDraggingItem(item);
  };

  const handleSetItem = (
    gesture: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => {
    const y = gesture.y;
    const isTop = y < halfLine.current;
    const yRange = isTop ? topYRange : bottomYRange;
    const horizontalOffset = isTop
      ? topPage * windowWidth
      : bottomPage * windowWidth;
    const list = isTop ? listOne : listTwo;
    if (y < yRange.start || y > yRange.end) return;
    // check if the user is hovering over an item
    const idx = Math.floor((gesture.x + horizontalOffset) / offset);
    // ensure idx is within bounds
    if (idx < 0 || idx > list.length - 1) return;
    const item = list[idx];
    item.count -= 1;
    setDraggingItem(item);
  };

  return {
    draggingItem,
    setDraggingItem,
    setContainerPage,
    containerSetItem,
    handleSetItem,
  };
}
