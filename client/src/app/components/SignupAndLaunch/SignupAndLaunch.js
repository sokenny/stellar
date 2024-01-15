import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import styles from './SignupAndLaunch.module.css';

const SignupAndLaunch = ({ onClose, experimentId }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleStopExperiment() {}

  return (
    <Modal onClose={onClose} className={styles.SignupAndLaunch} showX={false}>
      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>
            Are you sure you want to delete this experiment?
          </h3>
        </div>
        <div className={styles.actions}>
          <Button
            className={styles.deleteBtn}
            onClick={handleStopExperiment}
            disabled={submitting}
            loading={submitting}
          >
            Delete Experiment
          </Button>
          <div className={styles.cancel} onClick={onClose}>
            cancel
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SignupAndLaunch;
