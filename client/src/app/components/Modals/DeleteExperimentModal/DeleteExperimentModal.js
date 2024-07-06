import { useState } from 'react';
import useStore from '../../../store';
import { useRouter } from 'next/navigation';
import Modal from '../Modal/Modal';
import Button from '../../Button/Button';
import { toast } from 'sonner';
import styles from './DeleteExperimentModal.module.css';

const DeleteExperimentModal = ({
  onClose,
  experimentId,
  onComplete,
  isUnauthRequest,
}) => {
  const { refetchProjects } = useStore();
  const [submitting, setSubmitting] = useState(false);

  function handleDeleteExperiment() {
    setSubmitting(true);
    fetch(
      `${process.env.NEXT_PUBLIC_STELLAR_API}/${
        isUnauthRequest ? 'public' : 'api'
      }/experiment/${experimentId}`,
      {
        method: 'DELETE',
      },
    )
      .then((res) => res.json())
      .then((res) => {
        setSubmitting(false);
        toast.success('Experiment deleted');
        refetchProjects();
        onClose();
        onComplete && onComplete();
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
