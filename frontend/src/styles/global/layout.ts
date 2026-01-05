/**
 * Global layout values for the application
 */
export const Layout = {
  // Border radius
  borderRadius: {
    sm: 5,
    md: 10,
    lg: 15,
    xl: 20,
    round: 9999,
  },

  // Border widths
  borderWidth: {
    thin: 1,
    medium: 2,
    thick: 3,
  },

  // Standard dimensions
  dimensions: {
    buttonHeight: 50,
    inputHeight: 50,
  },
} as const;

export default Layout;
