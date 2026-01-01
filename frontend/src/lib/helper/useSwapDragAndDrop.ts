import { useRef, useState, useMemo } from "react";
import { Dimensions } from "react-native";
import {
    PanGestureHandlerEventPayload,
    GestureStateChangeEvent,
    Gesture,
    GestureUpdateEvent,
    PanGestureChangeEventPayload
} from "react-native-gesture-handler";
import { useSharedValue, withSpring, SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useHeaderHeight } from "@react-navigation/elements";

import { useEquipment } from "../context/EquipmentContext";
import { Item, Equipment, Container } from "../../types/models";
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
        currentMember,
        containerOverlayVisible: swapContainerVisible,
        setContainerOverlayVisible,
        setSelectedContainer,
        selectedContainer: containerItem,
        equipmentOverlayVisible,
        refresh,
        draggingItem,
        setDraggingItem
    } = useEquipment();

    const headerHeight = useHeaderHeight();

    // --- STATE & SHARED VALUES ---
    const [containerPage, setContainerPage] = useState(0);
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const dragScale = useSharedValue(1);
    const dragValues = { x: dragX, y: dragY, scale: dragScale };

    // --- REFS FOR HOVER LOGIC ---
    const prevPosition = useRef<string | null>(null);
    const containerTimeout = useRef<NodeJS.Timeout | null>(null);
    const overlayTimeout = useRef<NodeJS.Timeout | null>(null);
    const hoverContainer = useRef<Container | null>(null);

    // --- HELPER FUNCTIONS ---

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

    // --- ITEM SELECTION LOGIC (Previously useSet) ---

    /**
     * Logic for picking up an item from the main member lists
     */
    const handleSetItem = (e: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
        const y = e.absoluteY;
        if (!halfLine.current) return;

        const isTop = y < halfLine.current + headerHeight;
        const startY = isTop ? 140 + headerHeight : halfLine.current + 60 + headerHeight;
        const endY = startY + windowWidth / 3.5;

        if (y < startY || y > endY) return;

        // Calculate index based on scroll offset
        const offset = isTop ? topScrollOffset.value : bottomScrollOffset.value;
        const list = isTop ? listOne : listTwo;
        // Item width is windowWidth / 4 (ItemStyles) + windowWidth / 28 (margin)
        // = 1/4 + 1/28 = 7/28 + 1/28 = 8/28 = 2/7 of windowWidth
        // 2/7 = approx 0.2857
        const itemWidth = windowWidth / 3.5;

        const idx = Math.floor((e.absoluteX + offset) / itemWidth);

        if (idx >= 0 && idx < list.length) {
            setDraggingItem(list[idx]);
        }
    };

    /**
     * Logic for picking up an item from inside a container overlay
     */
    const containerSetItem = (e: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
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

        if (x < gridStartX || x > gridStartX + gridWidth || y < gridStartY || y > gridStartY + gridHeight) return;

        const row = Math.floor((y - gridStartY) / (rowHeight + rowGap));
        const col = Math.floor((x - gridStartX) / colWidth);

        if (row < 0 || row > 2 || col < 0 || col > 2) return;

        const idx = containerPage * 9 + row * 3 + col;

        if (idx >= 0 && idx < containerItem.equipment.length) {
            setDraggingItem(containerItem.equipment[idx]);
        }
    };

    // --- HOVER & SCROLL TRIGGER LOGIC (Previously useHover) ---

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

    /**
     * Main hover detection for horizontal scrolling and container highlighting
     */
    const handleHover = (e: GestureUpdateEvent<PanGestureChangeEventPayload & PanGestureHandlerEventPayload>) => {
        if (!draggingItem || !halfLine.current) return;

        const y = e.absoluteY;
        const x = e.absoluteX;
        const isTop = y < halfLine.current + headerHeight;

        const startY = isTop ? 140 + headerHeight : halfLine.current + 60 + headerHeight;
        const endY = startY + windowWidth / 5;

        // Position check
        let position = "";
        if (x < 40) position = "left";
        else if (x > windowWidth - 40) position = "right";
        else if (y < startY || y > endY) position = "out";
        else {
            // Calculate index for container hover
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
    };

    /**
     * Hover logic for closing the container overlay when dragging outside
     */
    const containerHover = (e: GestureUpdateEvent<PanGestureChangeEventPayload & PanGestureHandlerEventPayload>) => {
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

    // --- ANIMATION LOGIC (Opaque helper) ---
    const { animateStart, animateMove, animateFinalize } =
        useAnimateOverlay({ setDraggingItem, dragValues });

    // --- REASSIGNMENT LOGIC ---
    const handleReassign = async (
        gestureEvent: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
    ) => {
        if (!draggingItem) return;
        if (swapContainerVisible) return;
        if (!currentMember) return;

        const targetMember = gestureEvent.y < halfLine.current ? currentMember : swapUser.current;
        if (!targetMember) return;

        try {
            if (draggingItem.type === "equipment") {
                const equip = draggingItem as Equipment;
                const targetContainerId = hoverContainer.current?.id || null;
                await equip.reassign(db, targetMember.id, targetContainerId);
            } else {
                const container = draggingItem as Container;
                await container.reassign(db, targetMember.id);
            }
            await refresh();
        } catch (error) {
            console.error("Error reassigning item:", error);
        }
    };

    // --- GESTURE DEFINITION ---
    const panGesture = useMemo(() => Gesture.Pan()
        .maxPointers(1)
        .onStart((e) => {
            "worklet";
            if (equipmentOverlayVisible) return;
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
            equipmentOverlayVisible,
            swapContainerVisible,
            draggingItem,
            containerPage,
            currentMember,
            swapUser.current,
            containerItem,
            topScrollOffset,
            bottomScrollOffset,
            listOne,
            listTwo,
            halfLine.current
        ]);

    return {
        panGesture,
        draggingItem,
        dragValues,
        containerPage,
        setContainerPage,
    };
}
