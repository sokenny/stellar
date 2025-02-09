import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useStore from '../../../store';
import Modal from '../Modal/Modal';
import Input from '../../Input/Input';
import Button from '../../Button/Button';
import styles from './EditExperimentModal.module.css';

const EditExperimentModal = ({ onClose, experiment, initialValues = {} }) => {
  const router = useRouter();
  const { refetchProject, currentProject } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialValues);

  const onSave = useCallback(async () => {
    try {
      setSubmitting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experiment.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            experimentId: experiment.id,
          }),
        },
      );
      if (response.status === 200) {
        toast.success('Experiment updated');
        refetchProject(currentProject.id);
        onClose();
      }
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
