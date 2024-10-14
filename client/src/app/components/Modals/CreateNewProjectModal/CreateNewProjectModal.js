'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import styles from './CreateNewProjectModal.module.css';
import segmentTrack from '../../../helpers/segment/segmentTrack';
import CreateSimpleProjectForm from '../../CreateSimpleProjectForm';

const CreateNewProjectModal = ({
  isOpen,
  onOpenChange,
  onLaunch,
  experimentId,
}) => {
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
        {(onClose) => (
          <>
            <CreateSimpleProjectForm />
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default CreateNewProjectModal;
