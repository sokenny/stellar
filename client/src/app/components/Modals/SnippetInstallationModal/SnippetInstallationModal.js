'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
// TODO-p2: Explore the idea of making the check of the snippet missing just check a 1 in snippet status. This 1 should be set by the snippet itself when it is installed, by sending the api_key to the server. And maybe we will want 1 api key per project
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
              <SnippetMissing onSuccess={onClose} />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SnippetInstallationModal;
