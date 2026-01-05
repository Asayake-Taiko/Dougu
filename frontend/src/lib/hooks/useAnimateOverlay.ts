import {
  SharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import {
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
  GestureUpdateEvent,
  PanGestureChangeEventPayload,
} from "react-native-gesture-handler";
import { Dimensions } from "react-native";
import { useHeaderHeight } from '@react-navigation/elements';
import { Item } from "../../types/models";

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
  const animateStart = (
    gesture: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => {
    "worklet";
    dragValues.scale.value = withSpring(1.2);
    const halfEquipment = windowWidth / 10;
    dragValues.x.value = gesture.absoluteX - halfEquipment;
    dragValues.y.value = gesture.absoluteY - halfEquipment - headerHeight;
  };

  // we need to know how much the equipment has been moved
  const animateMove = (
    gestureState: GestureUpdateEvent<
      PanGestureChangeEventPayload & PanGestureHandlerEventPayload
    >,
  ) => {
    "worklet";
    const halfEquipment = windowWidth / 10;
    dragValues.x.value = gestureState.absoluteX - halfEquipment;
    dragValues.y.value = gestureState.absoluteY - halfEquipment - headerHeight;
  };

  // handle finalizing the drag and drop animation
  const animateFinalize = () => {
    "worklet";
    dragValues.scale.value = withTiming(0, undefined, (isFinished) => {
      if (isFinished) {
        scheduleOnRN(setDraggingItem, null);
      }
    });
  };

  return {
    size: dragValues.scale,
    movingStyles,
    animateStart,
    animateMove,
    animateFinalize,
  };
}
