/**
 * Global styles - centralized design system
 * Import from this file to access all global style constants
 */
// Convenience export for importing everything at once
import ColorsDefault from "./colors";
import SpacingDefault from "./spacing";
import TypographyDefault from "./typography";
import LayoutDefault from "./layout";

export { Colors, default as colors } from "./colors";
export { Spacing, default as spacing } from "./spacing";
export { Typography, default as typography } from "./typography";
export { Layout, default as layout } from "./layout";

export const GlobalStyles = {
  colors: ColorsDefault,
  spacing: SpacingDefault,
  typography: TypographyDefault,
  layout: LayoutDefault,
} as const;

export default GlobalStyles;
