import { useRef, useCallback } from "react";
import Animated, { SharedValue, AnimatedRef } from "react-native-reanimated";

export default function useScroll<T>(
  topListRef: AnimatedRef<Animated.FlatList<T>>,
  bottomListRef: AnimatedRef<Animated.FlatList<T>>,
  topScrollOffset: SharedValue<number>,
  bottomScrollOffset: SharedValue<number>
) {
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

  const startScrolling = useCallback((isTop: boolean, direction: "left" | "right") => {
    if (scrollInterval.current) return;

    const listRef = isTop ? topListRef : bottomListRef;
    const offset = isTop ? topScrollOffset : bottomScrollOffset;
    const step = direction === "left" ? -10 : 10;

    scrollInterval.current = setInterval(() => {
      const nextOffset = offset.value + step;
      if (nextOffset < 0) {
        // clamp to 0
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      } else {
        // We can't easily check max scroll without more state, but FlatList handles overscroll/bounds reasonably well or we can check contentSize if we had it.
        // For now, just scroll.
        listRef.current?.scrollToOffset({ offset: nextOffset, animated: false });
      }
    }, 16); // ~60fps
  }, [topListRef, bottomListRef, topScrollOffset, bottomScrollOffset]);

  const stopScrolling = useCallback(() => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  }, []);

  return {
    startScrolling,
    stopScrolling,
  };
}
