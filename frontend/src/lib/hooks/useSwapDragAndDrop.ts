import { useRef, useState, useMemo, useCallback } from "react";
import { Dimensions } from "react-native";
import {
  PanGestureHandlerEventPayload,
  GestureStateChangeEvent,
  Gesture,
  GestureUpdateEvent,
  PanGestureChangeEventPayload,
} from "react-native-gesture-handler";
import {
  useSharedValue,
  withSpring,
  SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useHeaderHeight } from "@react-navigation/elements";

import { useEquipment } from "../context/EquipmentContext";
import { useMembership } from "../context/MembershipContext";
import { Equipment, Container } from "../../types/models";
import { Item } from "../../types/other";
import { OrgMembershipRecord } from "../../types/db";
import { db } from "../powersync/PowerSync";
import useAnimateOverlay from "./useAnimateOverlay";

const { width: windowWidth } = Dimensions.get("window");

interface UseSwapDragAndDropProps {
  listOne: Item[];
  listTwo: Item[];
  topScrollOffset: SharedValue<number>;
  bottomScrollOffset: SharedValue<number>;
  swapUser: React.RefObject<OrgMembershipRecord | null>;
  startScrolling: (isTop: boolean, direction: "left" | "right") => void;
  stopScrolling: () => void;
  halfLine: React.RefObject<number>;
}

export default function useSwapDragAndDrop({
  listOne,
  listTwo,
  topScrollOffset,
  bottomScrollOffset,
  swapUser,
  startScrolling,
  stopScrolling,
  halfLine,
}: UseSwapDragAndDropProps) {
  const {
    setSelectedContainer,
    selectedContainer: containerItem,
    selectedEquipment,
  } = useEquipment();
  const { membership } = useMembership();

  const [draggingItem, setDraggingItem] = useState<Item | null>(null);

  const swapContainerVisible = !!containerItem;
  const isEquipmentOverlayVisible = !!selectedEquipment;

  const headerHeight = useHeaderHeight();

  // --- STATE & SHARED VALUES ---
  const [containerPage, setContainerPage] = useState(0);
  const dragX = useSharedValue<number>(0);
  const dragY = useSharedValue<number>(0);
  const dragScale = useSharedValue<number>(1);
  const dragValues = { x: dragX, y: dragY, scale: dragScale };

  // --- REFS FOR HOVER LOGIC ---
  const prevPosition = useRef<string | null>(null);
  const containerTimeout = useRef<NodeJS.Timeout | null>(null);
  const overlayTimeout = useRef<NodeJS.Timeout | null>(null);
  const hoverContainer = useRef<Container | null>(null);

  // --- HELPER FUNCTIONS ---

  const clearTimeouts = useCallback(() => {
    if (containerTimeout.current) {
      clearTimeout(containerTimeout.current);
      containerTimeout.current = null;
    }
    if (overlayTimeout.current) {
      clearTimeout(overlayTimeout.current);
      overlayTimeout.current = null;
    }
  }, []);

  // --- ITEM SELECTION LOGIC (Previously useSet) ---

  /**
   * Logic for picking up an item from the main member lists
   */
  const handleSetItem = useCallback(
    (e: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
      const y = e.absoluteY;
      if (!halfLine.current) return;

      const isTop = y < halfLine.current + headerHeight;
      const startY = isTop
        ? 140 + headerHeight
        : halfLine.current + 60 + headerHeight;
      const endY = startY + windowWidth / 3.5;

      if (y < startY || y > endY) return;

      // Calculate index based on scroll offset
      const offset = isTop ? topScrollOffset.value : bottomScrollOffset.value;
      const list = isTop ? listOne : listTwo;
      const itemWidth = windowWidth / 3.5;

      const idx = Math.floor((e.absoluteX + offset) / itemWidth);

      if (idx >= 0 && idx < list.length) {
        setDraggingItem(list[idx]);
      }
    },
    [
      halfLine,
      headerHeight,
      topScrollOffset,
      bottomScrollOffset,
      listOne,
      listTwo,
    ],
  );

  /**
   * Logic for picking up an item from inside a container overlay
   */
  const containerSetItem = useCallback(
    (e: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
      if (!containerItem) return;

      const x = e.absoluteX;
      const y = e.absoluteY;

      const containerTop = 125 + headerHeight;
      const overlayHeight = 500;
      const gridHeight = 410; // 3 * 130 + 2 * 10 (gap)
      const verticalAdjustment = (overlayHeight - gridHeight) / 2;
      const gridStartY = containerTop + verticalAdjustment;

      const containerWidth = 0.85 * windowWidth;
      const containerStartX = (windowWidth - containerWidth) / 2;
      const padding = 10;
      const gridStartX = containerStartX + padding;

      const rowHeight = 130;
      const rowGap = 10;
      const colWidth = (containerWidth - 2 * padding) / 3;

      const gridWidth = containerWidth - 2 * padding;

      if (
        x < gridStartX ||
        x > gridStartX + gridWidth ||
        y < gridStartY ||
        y > gridStartY + gridHeight
      )
        return;

      const row = Math.floor((y - gridStartY) / (rowHeight + rowGap));
      const col = Math.floor((x - gridStartX) / colWidth);

      if (row < 0 || row > 2 || col < 0 || col > 2) return;

      const idx = containerPage * 9 + row * 3 + col;

      if (idx >= 0 && idx < containerItem.equipment.length) {
        setDraggingItem(containerItem.equipment[idx]);
      }
    },
    [containerItem, headerHeight, containerPage],
  );

  // --- HOVER & SCROLL TRIGGER LOGIC (Previously useHover) ---

  const handleContainerHover = useCallback(
    (index: number, list: Item[]) => {
      const item = list[index];
      if (item && item.type === "container") {
        if (containerTimeout.current) return;
        containerTimeout.current = setTimeout(() => {
          dragValues.scale.value = withSpring(0.7);
          hoverContainer.current = item as Container;
          containerTimeout.current = null;
        }, 500);
      }
    },
    [dragValues.scale],
  );

  const handleHover = useCallback(
    (
      e: GestureUpdateEvent<
        PanGestureChangeEventPayload & PanGestureHandlerEventPayload
      >,
    ) => {
      if (!draggingItem || !halfLine.current) return;

      const y = e.absoluteY;
      const x = e.absoluteX;
      const isTop = y < halfLine.current + headerHeight;

      const startY = isTop
        ? 140 + headerHeight
        : halfLine.current + 60 + headerHeight;
      const endY = startY + windowWidth / 5;

      // Position check
      let position = "";
      if (x < 40) position = "left";
      else if (x > windowWidth - 40) position = "right";
      else if (y < startY || y > endY) position = "out";
      else {
        const offset = isTop ? topScrollOffset.value : bottomScrollOffset.value;
        const itemWidth = windowWidth / 3.5;
        const idx = Math.floor((x + offset) / itemWidth);
        position = `${isTop}-${idx}`;
      }

      if (position !== prevPosition.current) {
        clearTimeouts();
        stopScrolling();
        hoverContainer.current = null;
        dragValues.scale.value = withSpring(1.2);
      }

      if (position === "left" || position === "right") {
        startScrolling(isTop, position);
      } else if (position !== "out" && draggingItem.type === "equipment") {
        const list = isTop ? listOne : listTwo;
        const offset = isTop ? topScrollOffset.value : bottomScrollOffset.value;
        const itemWidth = windowWidth / 3.5;
        const idx = Math.floor((x + offset) / itemWidth);
        handleContainerHover(idx, list);
      }

      prevPosition.current = position;
    },
    [
      draggingItem,
      halfLine,
      headerHeight,
      topScrollOffset,
      bottomScrollOffset,
      clearTimeouts,
      stopScrolling,
      dragValues.scale,
      startScrolling,
      listOne,
      listTwo,
      handleContainerHover,
    ],
  );

  const containerHover = useCallback(
    (
      e: GestureUpdateEvent<
        PanGestureChangeEventPayload & PanGestureHandlerEventPayload
      >,
    ) => {
      const x = e.absoluteX;
      const y = e.absoluteY;

      const containerTop = 125 + headerHeight;
      const overlayHeight = 500;

      const startX = 0.075 * windowWidth;
      const endX = 0.925 * windowWidth;
      const startY = containerTop;
      const endY = containerTop + overlayHeight;

      if (x < startX || x > endX || y < startY || y > endY) {
        if (!overlayTimeout.current) {
          overlayTimeout.current = setTimeout(() => {
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
    },
    [headerHeight, setSelectedContainer],
  );

  // --- ANIMATION LOGIC (Opaque helper) ---
  const { animateStart, animateMove, animateFinalize } = useAnimateOverlay({
    setDraggingItem,
    dragValues,
  });

  // --- REASSIGNMENT LOGIC ---
  const handleReassign = useCallback(
    async (
      gestureEvent: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    ) => {
      if (!draggingItem) return;
      if (swapContainerVisible) return;
      if (!membership) return;

      const targetMember =
        gestureEvent.y < halfLine.current ? membership : swapUser.current;
      if (!targetMember) return;

      try {
        if (draggingItem.type === "equipment") {
          const equip = draggingItem as Equipment;
          const targetContainerId = hoverContainer.current?.id || null;
          await equip.reassign(db, targetMember.id, targetContainerId);
          equip.clearSelection();
        } else {
          const container = draggingItem as Container;
          await container.reassign(db, targetMember.id);
        }
      } catch (error) {
        console.error("Error reassigning item:", error);
      }
    },
    [draggingItem, swapContainerVisible, membership, halfLine, swapUser],
  );

  // --- GESTURE DEFINITION ---
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .onStart((e) => {
          "worklet";
          if (isEquipmentOverlayVisible) return;
          animateStart(e);

          if (swapContainerVisible) scheduleOnRN(containerSetItem, e);
          else scheduleOnRN(handleSetItem, e);
        })
        .onChange((e) => {
          "worklet";
          animateMove(e);
          if (swapContainerVisible) scheduleOnRN(containerHover, e);
          else scheduleOnRN(handleHover, e);
        })
        .onFinalize((e) => {
          "worklet";
          animateFinalize();
          scheduleOnRN(handleReassign, e);
          scheduleOnRN(clearTimeouts);
          scheduleOnRN(stopScrolling);
        })
        .activateAfterLongPress(500),
    [
      isEquipmentOverlayVisible,
      animateStart,
      swapContainerVisible,
      containerSetItem,
      handleSetItem,
      animateMove,
      containerHover,
      handleHover,
      animateFinalize,
      handleReassign,
      stopScrolling,
      clearTimeouts,
    ],
  );

  return {
    panGesture,
    draggingItem,
    setDraggingItem,
    dragValues,
    containerPage,
    setContainerPage,
  };
}
