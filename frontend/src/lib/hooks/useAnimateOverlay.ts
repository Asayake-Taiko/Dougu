import {
  SharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useCallback } from "react";
import { scheduleOnRN } from "react-native-worklets";
import {
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
  GestureUpdateEvent,
  PanGestureChangeEventPayload,
} from "react-native-gesture-handler";
import { Dimensions } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Item } from "../../types/other";

const { width: windowWidth } = Dimensions.get("window");

/*
  This hook handles animations for the overlay that appears when an 
  equipment is dragged around the screen. We use an overlay because 
  scrollviews would cut off the equipment when dragged outside of the
  screen.
*/
export default function useAnimateOverlay({
  setDraggingItem,
  dragValues,
}: {
  setDraggingItem: (item: Item | null) => void;
  dragValues: {
    x: SharedValue<number>;
    y: SharedValue<number>;
    scale: SharedValue<number>;
  };
}) {
  const headerHeight = useHeaderHeight();

  const movingStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: dragValues.x.value },
        { translateY: dragValues.y.value },
        { scale: dragValues.scale.value },
      ],
    };
  });

  // we need to know where to start the dragging animation
  const animateStart = useCallback(
    (gesture: GestureStateChangeEvent<PanGestureHandlerEventPayload>) => {
      "worklet";
      dragValues.scale.value = withSpring(1.2);
      const halfEquipment = windowWidth / 10;
      dragValues.x.value = gesture.absoluteX - halfEquipment;
      dragValues.y.value = gesture.absoluteY - halfEquipment - headerHeight;
    },
    [dragValues.scale, dragValues.x, dragValues.y, headerHeight],
  );

  // we need to know how much the equipment has been moved
  const animateMove = useCallback(
    (
      gestureState: GestureUpdateEvent<
        PanGestureChangeEventPayload & PanGestureHandlerEventPayload
      >,
    ) => {
      "worklet";
      const halfEquipment = windowWidth / 10;
      dragValues.x.value = gestureState.absoluteX - halfEquipment;
      dragValues.y.value =
        gestureState.absoluteY - halfEquipment - headerHeight;
    },
    [dragValues.x, dragValues.y, headerHeight],
  );

  // handle finalizing the drag and drop animation
  const animateFinalize = useCallback(() => {
    "worklet";
    dragValues.scale.value = withTiming(0, undefined, (isFinished) => {
      if (isFinished) {
        scheduleOnRN(setDraggingItem, null);
      }
    });
  }, [dragValues.scale, setDraggingItem]);

  return {
    size: dragValues.scale,
    movingStyles,
    animateStart,
    animateMove,
    animateFinalize,
  };
}
