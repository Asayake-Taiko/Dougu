import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, Modal, TouchableWithoutFeedback } from 'react-native';
import { Colors, Spacing, Typography, Layout } from '../../styles/global';
import { PressableOpacity } from '../../components/PressableOpacity';

interface ModalContextType {
  message: string | null;
  setMessage: (message: string | null) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);

  const handleClose = () => {
    setMessage(null);
  };

  return (
    <ModalContext.Provider value={{ message, setMessage }}>
      {children}
      <Modal
        visible={message !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <Text style={styles.messageText}>{message}</Text>
                <PressableOpacity style={styles.closeButton} onPress={handleClose}>
                  <Text style={styles.closeButtonText}>OK</Text>
                </PressableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ModalContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    padding: Spacing.lg,
    width: '80%',
    maxWidth: 400,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  messageText: {
    fontSize: Typography.fontSize.md,
    color: Colors.dark,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: Colors.primary,
    borderRadius: Layout.borderRadius.sm,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
  },
});
