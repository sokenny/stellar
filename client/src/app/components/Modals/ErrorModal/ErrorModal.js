'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import useStore from '../../../store';
import styles from './ErrorModal.module.css';

const ErrorModal = ({ message, isOpen, onOpenChange }) => {
  const { setErrorModal } = useStore();
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      className={styles.modal}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className={`flex flex-col gap-1 ${styles.title}`}>
              An error occured
            </ModalHeader>
            <ModalBody className={styles.body}>
              <p>{message}</p>
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => {
                  onClose();
                  setErrorModal(null);
                }}
                className={styles.button}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ErrorModal;
