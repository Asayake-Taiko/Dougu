import {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  GestureStateChangeEvent,
  PanGestureHandlerEventPayload,
  GestureUpdateEvent,
  PanGestureChangeEventPayload,
} from "react-native-gesture-handler";

import { Position, EquipmentObj } from "../../types/ModelTypes";
import { useDimensions } from "../../helper/context/DimensionsContext";

/*
  This hook hanndles animations for the overlay that apperas when an 
  equipment is dragged around the screen. We use an overlay because 
  scrollviews would cut off the equipment when dragged outside of the
  screen.
*/
export default function useAnimateOverlay({
  setDraggingItem,
}: {
  setDraggingItem: (item: EquipmentObj | null) => void;
}) {
  const { windowWidth } = useDimensions();
  const size = useSharedValue(1);
  const draggingOffset = useSharedValue<Position>({
    x: 0,
    y: 0,
  });
  const movingStyles = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: draggingOffset.value.x },
        { translateY: draggingOffset.value.y },
        { scale: size.value },
      ],
    };
  });

  // we need to know where to start the dragging animation
  const animateStart = (
    gesture: GestureStateChangeEvent<PanGestureHandlerEventPayload>,
  ) => {
    "worklet";
    size.value = withSpring(1.2);
    const halfEquipment = windowWidth / 10;
    draggingOffset.value = {
      x: gesture.x - halfEquipment,
      y: gesture.y - halfEquipment,
    };
  };

  // we need to know how much the equipment has been moved
  const animateMove = (
    gestureState: GestureUpdateEvent<
      PanGestureChangeEventPayload & PanGestureHandlerEventPayload
    >,
  ) => {
    "worklet";
    draggingOffset.value = {
      x: gestureState.changeX + draggingOffset.value.x,
      y: gestureState.changeY + draggingOffset.value.y,
    };
  };

  // handle finalizing the drag and drop animation
  const animateFinalize = () => {
    "worklet";
    size.value = withTiming(0, undefined, (isFinished) => {
      if (isFinished) {
        runOnJS(setDraggingItem)(null);
      }
    });
  };

  return {
    size,
    movingStyles,
    animateStart,
    animateMove,
    animateFinalize,
  };
}
