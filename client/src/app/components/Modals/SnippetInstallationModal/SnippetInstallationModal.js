'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import SnippetMissing from '../../SnippetMissing';
import styles from './SnippetInstallationModal.module.css';

const SnippetInstallationModal = ({ isOpen, onOpenChange }) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={false}
      className={styles.modal}
    >
      <ModalContent className={styles.content}>
        {(onClose) => (
          <>
            <ModalHeader className={`flex flex-col gap-1 ${styles.title}`}>
              Looks like you need to install your snippet before performing this
              action
            </ModalHeader>
            <ModalBody className={styles.body}>
              <SnippetMissing />
            </ModalBody>
            {/* <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                className={styles.button}
              >
                Close
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  onClose();
                }}
                className={styles.button}
              >
                Launch Experiment
              </Button>
            </ModalFooter> */}
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SnippetInstallationModal;
