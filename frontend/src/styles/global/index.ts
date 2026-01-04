/**
 * Global styles - centralized design system
 * Import from this file to access all global style constants
 */
export { Colors, default as colors } from "./colors";
export { Spacing, default as spacing } from "./spacing";
export { Typography, default as typography } from "./typography";
export { Layout, default as layout } from "./layout";

// Convenience export for importing everything at once
import Colors from "./colors";
import Spacing from "./spacing";
import Typography from "./typography";
import Layout from "./layout";

export const GlobalStyles = {
  colors: Colors,
  spacing: Spacing,
  typography: Typography,
  layout: Layout,
} as const;

export default GlobalStyles;
