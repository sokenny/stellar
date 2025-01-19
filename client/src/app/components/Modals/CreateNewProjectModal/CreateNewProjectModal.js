'use client';
import { Modal, ModalContent } from '@nextui-org/react';
import styles from './CreateNewProjectModal.module.css';
import CreateSimpleProjectForm from '../../CreateSimpleProjectForm';

const CreateNewProjectModal = ({ isOpen, onOpenChange }) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={true}
      className={styles.modal}
      hideCloseButton
      size="xl"
    >
      <ModalContent>
        {() => (
          <>
            <CreateSimpleProjectForm />
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateNewProjectModal;
