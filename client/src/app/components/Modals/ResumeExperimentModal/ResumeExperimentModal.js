import useStore from '../../../store';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Modal from '../Modal/Modal';
import Button from '../../Button/Button';
import styles from './ResumeExperimentModal.module.css';

const ResumeExperimentModal = ({ onClose, experimentId }) => {
  const router = useRouter();
  const { refetchExperiment } = useStore();
  const [submitting, setSubmitting] = useState(false);

  function handleResumeExperiment() {
    setSubmitting(true);
    fetch(
      `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experimentId}/on`,
      {
        method: 'POST',
      },
    )
      .then((res) => res.json())
      .then((res) => {
        setSubmitting(false);
        refetchExperiment(experimentId);
        toast.success('Experiment turned on');
        onClose();
      });
  }

  return (
    <Modal
      onClose={onClose}
      className={styles.ResumeExperimentModal}
      showX={false}
    >
      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>
            Are you sure you want to turn on this experiment?
          </h3>
        </div>
        <div className={styles.actions}>
          <Button
            className={styles.resumeBtn}
            onClick={handleResumeExperiment}
            disabled={submitting}
            loading={submitting}
          >
            Turn On Experiment
          </Button>
          <div className={styles.cancel} onClick={onClose}>
            cancel
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ResumeExperimentModal;
