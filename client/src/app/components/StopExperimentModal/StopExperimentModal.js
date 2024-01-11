import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../Modal/Modal';
import styles from './StopExperimentModal.module.css';
import Button from '../Button/Button';

const StopExperimentModal = ({ onClose, experimentId }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleStopExperiment() {
    if (confirm('Are you absolutely sure?') === false) {
      onClose();
      return;
    }
    setSubmitting(true);
    fetch(`http://localhost:3001/api/experiment/${experimentId}/stop`, {
      method: 'POST',
    })
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
      className={styles.StopExperimentModal}
      showX={false}
    >
      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>
            Are you sure you want to stop this experiment
          </h3>
        </div>
        <div className={styles.actions}>
          <Button
            className={styles.save}
            onClick={handleStopExperiment}
            disabled={submitting}
            loading={submitting}
          >
            Stop Experiment
          </Button>
          <div className={styles.cancel} onClick={onClose}>
            cancel
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StopExperimentModal;
