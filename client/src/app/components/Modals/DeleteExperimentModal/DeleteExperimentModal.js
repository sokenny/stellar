import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../Modal/Modal';
import Button from '../../Button/Button';
import { toast } from 'sonner';
import styles from './DeleteExperimentModal.module.css';

const DeleteExperimentModal = ({ onClose, experimentId }) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleDeleteExperiment() {
    if (confirm('Are you absolutely sure?') === false) {
      onClose();
      return;
    }
    setSubmitting(true);
    fetch(`${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experimentId}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((res) => {
        setSubmitting(false);
        toast.success('Experiment deleted');
        router.refresh();
        onClose();
      });
  }

  return (
    <Modal
      onClose={onClose}
      className={styles.DeleteExperimentModal}
      showX={false}
    >
      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>
            Are you sure you want to delete this experiment?
          </h3>
        </div>
        <div className={styles.actions}>
          <Button
            className={styles.deleteBtn}
            onClick={handleDeleteExperiment}
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

export default DeleteExperimentModal;
