import { useCallback, useState, useRef } from 'react';
import isObjectEqual from '../../helpers/isObjectEqual';
import Input from '../Input/Input';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import styles from './EditVariantModal.module.css';

const EditVariantModal = ({ onClose, initialValues = {} }) => {
  const initialValuesRef = useRef(initialValues);
  const [formData, setFormData] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);

  const isFormPristine = isObjectEqual(formData, initialValuesRef.current);

  const onSave = useCallback(async () => {}, [formData]);
  return (
    <Modal onClose={onClose}>
      <div className={styles.header}>
        <h3 className={styles.title}>Edit Variant</h3>
      </div>
      <div className={styles.fields}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Text:</label>
          <Input
            type="text"
            value={formData?.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Traffic:</label>
          <Input
            type="number"
            value={formData?.traffic}
            onChange={(e) =>
              setFormData({ ...formData, traffic: e.target.value })
            }
            disabled={true}
          />
        </div>
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.save}
          onClick={onSave}
          disabled={isFormPristine || submitting}
          loading={submitting}
        >
          Save
        </Button>
        <div className={styles.cancel} onClick={onClose}>
          cancel
        </div>
      </div>
    </Modal>
  );
};

export default EditVariantModal;
