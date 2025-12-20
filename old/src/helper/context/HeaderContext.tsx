import React, { useState, useContext } from "react";
import { HeaderContextType } from "../../types/ContextTypes";

const HeaderContext = React.createContext<HeaderContextType | undefined>(
  undefined,
);

/* 
    Context that distributes the loading state to the app
    if loading, the app will display a loading indicator
    if !dataStoreReady, a loading page will be displayed
*/
export default function HeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [infoFocus, setInfoFocus] = useState(true);
  const [orgStackFocus, setOrgStackFocus] = useState(false);

  return (
    <HeaderContext.Provider
      value={{
        infoFocus,
        setInfoFocus,
        orgStackFocus,
        setOrgStackFocus,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}

// ensure that LoadingContext isn't undefined in useLoad
export const useHeader = (): HeaderContextType => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error("useLoad must be used within a LoadingProvider");
  }
  return context;
};
