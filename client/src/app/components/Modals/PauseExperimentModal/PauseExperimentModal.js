import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../Modal/Modal';
import Button from '../../Button/Button';
import styles from './PauseExperimentModal.module.css';

const PauseExperimentModal = ({ onClose, experimentId }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handlePauseExperiment() {
    setSubmitting(true);
    fetch(
      `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experimentId}/pause`,
      {
        method: 'POST',
      },
    )
      .then((res) => res.json())
      .then((res) => {
        setSubmitting(false);
        router.refresh();
        onClose();
      });
  }

  return (
    <Modal
      onClose={onClose}
      className={styles.PauseExperimentModal}
      showX={false}
    >
      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>
            Are you sure you want to pause this experiment?
          </h3>
        </div>
        <div className={styles.actions}>
          <Button
            className={styles.pauseBtn}
            onClick={handlePauseExperiment}
            disabled={submitting}
            loading={submitting}
          >
            Pause Experiment
          </Button>
          <div className={styles.cancel} onClick={onClose}>
            cancel
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PauseExperimentModal;
