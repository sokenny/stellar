import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../Modal/Modal';
import Input from '../Input/Input';
import styles from './EditExperimentModal.module.css';
import Button from '../Button/Button';

const EditExperimentModal = ({
  onClose,
  experiment,
  journeyId = null,
  initialValues = {},
}) => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialValues);

  const onSave = useCallback(async () => {
    try {
      setSubmitting(true);
      const response = await fetch(
        `http://localhost:3001/api/experiment/${experiment.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            experimentId: experiment.id,
            journeyId,
          }),
        },
      );
      const data = await response.json();
      console.log(data);
      router.refresh();
      onClose();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  }, [formData, experiment.id, router]);

  return (
    <Modal onClose={onClose}>
      <div>
        <div className={styles.header}>
          <h3 className={styles.title}>Edit Experiment</h3>
        </div>
        <div className={styles.fields}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Name:</label>
            <Input
              type="text"
              value={formData?.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          {!experiment.started_at && (
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Order:</label>
              {/* TODO: Add validation for order. min 1 and max #of experiments in journey */}
              <Input
                type="number"
                value={formData?.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: e.target.value })
                }
              />
            </div>
          )}
        </div>
        <div className={styles.actions}>
          <Button
            className={styles.save}
            onClick={onSave}
            disabled={submitting}
            loading={submitting}
          >
            Save
          </Button>
          <div className={styles.cancel} onClick={onClose}>
            cancel
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditExperimentModal;
