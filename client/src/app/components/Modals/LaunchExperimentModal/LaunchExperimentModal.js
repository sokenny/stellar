'use client';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import styles from './LaunchExperimentModal.module.css';
import segmentTrack from '../../../helpers/segment/segmentTrack';

const LaunchExperimentModal = ({
  isOpen,
  onOpenChange,
  onLaunch,
  experimentId,
}) => {
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
              Keep in mind
            </ModalHeader>
            <ModalBody className={styles.body}>
              <p>
                <div className={styles.items}>
                  <div>
                    <b>1.</b> Your experiment will go live and the target page
                    will begin to display the created variants.
                  </div>
                  <div>
                    <b>2.</b> You will not be able to make further edits to your
                    variants or goal inside this experiment.
                  </div>
                  <div>
                    <b>3.</b> You should not perform HTML updates to the
                    targeted page while the experiment is running.
                  </div>
                </div>
              </p>
            </ModalBody>
            <ModalFooter>
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
                  segmentTrack('launch_experiment', {
                    experimentId: experimentId,
                  });
                  onLaunch();
                  onClose();
                }}
                className={styles.button}
              >
                Launch Experiment
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default LaunchExperimentModal;
