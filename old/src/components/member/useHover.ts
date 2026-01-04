import { useRef } from "react";
import {
  GestureUpdateEvent,
  PanGestureChangeEventPayload,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import { SharedValue, withSpring } from "react-native-reanimated";

import { useEquipment } from "../../helper/context/EquipmentContext";
import { ContainerObj, ItemObj } from "../../types/ModelTypes";

export default function useHover({
  windowWidth,
  windowHeight,
  halfLine,
  draggingItem,
  topPage,
  bottomPage,
  size,
  listOne,
  listTwo,
  handleScroll,
  clearScroll,
}: {
  windowWidth: number;
  windowHeight: number;
  halfLine: React.MutableRefObject<number>;
  draggingItem: ItemObj | null;
  topPage: number;
  bottomPage: number;
  size: SharedValue<number>;
  listOne: ItemObj[];
  listTwo: ItemObj[];
  handleScroll: (isTop: boolean, position: string) => void;
  clearScroll: () => void;
}) {
  const prevPosition = useRef<string | null>(null);
  const containerTimeout = useRef<NodeJS.Timeout | null>(null);
  const overlayTimeout = useRef<NodeJS.Timeout | null>(null);
  const hoverContainer = useRef<ContainerObj | null>(null);
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
  const { setContainerItem, setSwapContainerVisible } = useEquipment();

  // when dragging an equipment while the container overlay is visible
  const containerHover = (
    gestureState: GestureUpdateEvent<
      PanGestureChangeEventPayload & PanGestureHandlerEventPayload
    >,
  ) => {
    if (!draggingItem) return;
    const x = gestureState.x;
    const y = gestureState.y;
    if (
      x < containerXRange.start ||
      x > containerXRange.end ||
      y < containerYRange.start ||
      y > containerYRange.end
    ) {
      if (overlayTimeout.current) {
        return;
      } else {
        overlayTimeout.current = setTimeout(() => {
          setSwapContainerVisible(false);
          setContainerItem(null);
          overlayTimeout.current = null;
        }, 500);
      }
    }
  };

  //Determine if an equiment item is hovering over a container item
  //and change the size of the equipment item accordingl
  const handleHover = (
    gestureState: GestureUpdateEvent<
      PanGestureChangeEventPayload & PanGestureHandlerEventPayload
    >,
  ) => {
    if (!draggingItem) return;
    const isTop = gestureState.y < halfLine.current;
    const range = isTop ? topYRange : bottomYRange;
    const x = gestureState.x;
    // leftEdge, rightEdge, top-position
    if (x < 40) {
      handlePosition("left", isTop);
    } else if (x > windowWidth - 40) {
      handlePosition("right", isTop);
    } else if (gestureState.y < range.start || gestureState.y > range.end) {
      handlePosition("out", isTop);
    } else {
      const horizontalOffset = isTop
        ? topPage * windowWidth
        : bottomPage * windowWidth;
      const position = Math.floor((gestureState.x + horizontalOffset) / offset);
      handlePosition(`${isTop}-${position}`, isTop, position);
    }
  };

  // handles the case where the equipment item is hovering over a container item
  const handleContainer = (isTop: boolean, index: number) => {
    const list = isTop ? listOne : listTwo;
    const item = list[index];
    if (item && item.type === "container") {
      if (containerTimeout.current) {
        return;
      }
      containerTimeout.current = setTimeout(() => {
        size.value = withSpring(0.7);
        hoverContainer.current = item as ContainerObj;
        containerTimeout.current = null;
      }, 500);
    }
  };

  const clearTimeouts = () => {
    if (containerTimeout.current) {
      clearTimeout(containerTimeout.current);
      containerTimeout.current = null;
    }
    if (overlayTimeout.current) {
      clearTimeout(overlayTimeout.current);
      overlayTimeout.current = null;
    }
  };

  // depending on the position of the equipment item, call the appropriate function
  const handlePosition = (position: string, isTop: boolean, index?: number) => {
    if (position !== prevPosition.current) {
      clearTimeouts();
      clearScroll();
      hoverContainer.current = null;
      size.value = withSpring(1.2);
    } else if (position === "left" || position === "right") {
      // if the equipment item is hovering over a scroll area
      handleScroll(isTop, position);
    } else {
      if (draggingItem?.type === "container" || index == null) return;
      // if the equipment item is hovering over a container item
      handleContainer(isTop, index);
    }
    prevPosition.current = position;
  };

  return {
    handleHover,
    containerHover,
    hoverContainer,
    clearTimeouts,
  };
}
