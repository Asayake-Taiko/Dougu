import React, { useState, useContext, useEffect } from "react";
import { DimensionsContextType } from "../../types/ContextTypes";
import { Dimensions } from "react-native";

const DimensionsContext = React.createContext<
  DimensionsContextType | undefined
>(undefined);

/* 
    Context that distributes the windowWidth and windowHeight to the app
    since screen orientation changes the window dimensions
*/
export default function DimensionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get("window").width,
  );
  const [windowHeight, setWindowHeight] = useState(
    Dimensions.get("window").height,
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setWindowWidth(window.width);
      setWindowHeight(window.height);
    });
    return () => subscription?.remove();
  });

  return (
    <DimensionsContext.Provider value={{ windowWidth, windowHeight }}>
      {children}
    </DimensionsContext.Provider>
  );
}

// ensure that LoadingContext isn't undefined in useLoad
export const useDimensions = (): DimensionsContextType => {
  const context = useContext(DimensionsContext);
  if (!context) {
    throw new Error("useLoad must be used within a LoadingProvider");
  }
  return context;
};
