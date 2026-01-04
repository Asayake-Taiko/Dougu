import React, { useState, useContext } from "react";
import { LoadingContextType } from "../../types/ContextTypes";

const LoadingContext = React.createContext<LoadingContextType | undefined>(
  undefined,
);

/* 
    Context that distributes the loading state to the app
    if loading, the app will display a loading indicator
    if !dataStoreReady, a loading page will be displayed
*/
export default function LoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

// ensure that LoadingContext isn't undefined in useLoad
export const useLoad = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoad must be used within a LoadingProvider");
  }
  return context;
};
