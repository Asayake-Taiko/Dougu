/**
 * Global typography settings for the application
 */
export const Typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },

  // Font weights
  fontWeight: {
    normal: "normal" as const,
    bold: "bold" as const,
    "100": "100" as const,
    "200": "200" as const,
    "300": "300" as const,
    "400": "400" as const,
    "500": "500" as const,
    "600": "600" as const,
    "700": "700" as const,
    "800": "800" as const,
    "900": "900" as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export default Typography;
