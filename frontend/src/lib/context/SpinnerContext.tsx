import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import SpinningIndicator from '../../components/SpinningIndicator';

interface SpinnerContextType {
  showSpinner: () => void;
  hideSpinner: () => void;
}

const SpinnerContext = createContext<SpinnerContextType | undefined>(undefined);

export const useSpinner = () => {
  const context = useContext(SpinnerContext);
  if (!context) {
    throw new Error('useSpinner must be used within a SpinnerProvider');
  }
  return context;
};

interface SpinnerProviderProps {
  children: ReactNode;
}

export const SpinnerProvider: React.FC<SpinnerProviderProps> = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    const showSpinner = () => {
        setIsVisible(true);
        
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        // Set 10 second timeout to auto-hide
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
            timeoutRef.current = null;
        }, 10000);
    };
    
    const hideSpinner = () => {
        setIsVisible(false);
        
        // Clear timeout if spinner is manually hidden
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    return (
        <SpinnerContext.Provider value={{ showSpinner, hideSpinner }}>
        {children}
        {isVisible && (
            <View style={styles.overlay}>
            <SpinningIndicator />
            </View>
        )}
        </SpinnerContext.Provider>
    );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    zIndex: 9999,
  },
});
