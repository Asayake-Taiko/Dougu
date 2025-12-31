import { useRef } from "react";
import { PanGestureChangeEventPayload, GestureUpdateEvent } from "react-native-gesture-handler";
import { Dimensions } from "react-native";
import { withSpring } from "react-native-reanimated";
import { Item, Container } from "../../types/models";
import { useEquipment } from "../context/EquipmentContext";

const { width: windowWidth, height: windowHeight } = Dimensions.get("window");

export default function useHover({
  halfLine,
  draggingItem,
  topPage,
  bottomPage,
  size,
  listOne,
  listTwo,
  handleScroll,
  clearScroll,
  headerHeight,
}: {
  halfLine: React.RefObject<number>;
  draggingItem: Item | null;
  topPage: number;
  bottomPage: number;
  size: any; // Using SharedValue but type varies
  listOne: Item[];
  listTwo: Item[];
  handleScroll: (isTop: boolean, direction: string) => void;
  clearScroll: () => void;
  headerHeight: number;
}) {
  const { setContainerOverlayVisible, setSelectedContainer, dragValues } = useEquipment();
  const prevPosition = useRef<string | null>(null);
  const containerTimeout = useRef<NodeJS.Timeout | null>(null);
  const overlayTimeout = useRef<NodeJS.Timeout | null>(null);
  const hoverContainer = useRef<Container | null>(null);

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

  const handleContainerHover = (index: number, list: Item[]) => {
    const item = list[index];
    if (item && item.type === "container") {
      if (containerTimeout.current) return;
      containerTimeout.current = setTimeout(() => {
        dragValues.scale.value = withSpring(0.7);
        hoverContainer.current = item as Container;
        containerTimeout.current = null;
      }, 500);
    }
  };

  const handleHover = (e: GestureUpdateEvent<PanGestureChangeEventPayload>) => {
    if (!draggingItem || !halfLine.current) return;

    const y = e.absoluteY;
    const x = e.absoluteX;
    const isTop = y < halfLine.current + headerHeight;

    const startY = isTop ? 140 + headerHeight : halfLine.current + 60 + headerHeight;
    const endY = startY + windowWidth / 5;

    let position = "";
    if (x < 40) position = "left";
    else if (x > windowWidth - 40) position = "right";
    else if (y < startY || y > endY) position = "out";
    else {
      const page = isTop ? topPage : bottomPage;
      const offset = page * windowWidth;
      const idx = Math.floor((x + offset) / (windowWidth / 4));
      position = `${isTop}-${idx}`;
    }

    if (position !== prevPosition.current) {
      clearTimeouts();
      clearScroll();
      hoverContainer.current = null;
      dragValues.scale.value = withSpring(1.2);
    }

    if (position === "left" || position === "right") {
      handleScroll(isTop, position);
    } else if (position !== "out" && draggingItem.type === "equipment") {
      const list = isTop ? listOne : listTwo;
      const page = isTop ? topPage : bottomPage;
      const offset = page * windowWidth;
      const idx = Math.floor((x + offset) / (windowWidth / 4));
      handleContainerHover(idx, list);
    }

    prevPosition.current = position;
  };

  const containerHover = (e: GestureUpdateEvent<PanGestureChangeEventPayload>) => {
    const x = e.absoluteX;
    const y = e.absoluteY;

    const startX = 0.075 * windowWidth;
    const endX = 0.925 * windowWidth;
    const startY = 0.2 * windowHeight;
    const endY = 0.7 * windowHeight + 30;

    if (x < startX || x > endX || y < startY || y > endY) {
      if (!overlayTimeout.current) {
        overlayTimeout.current = setTimeout(() => {
          setContainerOverlayVisible(false);
          setSelectedContainer(null);
          overlayTimeout.current = null;
        }, 500);
      }
    } else {
      if (overlayTimeout.current) {
        clearTimeout(overlayTimeout.current);
        overlayTimeout.current = null;
      }
    }
  };

  return { handleHover, clearTimeouts, containerHover, hoverContainer };
}
