import React, { useCallback } from "react";
import { Pressable, PressableProps, StyleProp, ViewStyle } from "react-native";

interface PressableOpacityProps extends PressableProps {
  /**
   * Opacity when the button is pressed.
   * @default 0.2
   */
  activeOpacity?: number;
  style?:
    | StyleProp<ViewStyle>
    | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
  children?:
    | React.ReactNode
    | ((state: { pressed: boolean }) => React.ReactNode);
}

export const PressableOpacity: React.FC<PressableOpacityProps> = ({
  activeOpacity = 0.2,
  style,
  children,
  ...props
}) => {
  const getStyle = useCallback(
    ({ pressed }: { pressed: boolean }) => {
      const baseStyle =
        typeof style === "function" ? style({ pressed }) : style;
      return [baseStyle, { opacity: pressed ? activeOpacity : 1 }];
    },
    [style, activeOpacity],
  );

  return (
    <Pressable style={getStyle} {...props}>
      {children}
    </Pressable>
  );
};
