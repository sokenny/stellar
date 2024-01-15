import { useCallback, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import isObjectEqual from '../../helpers/isObjectEqual';
import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import Input from '../Input/Input';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import styles from './EditVariantModal.module.css';

const EditVariantModal = ({
  onClose,
  id,
  experimentStatus,
  variants,
  initialValues = {},
}) => {
  const router = useRouter();
  const initialValuesRef = useRef(initialValues);
  const [formData, setFormData] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const isFormPristine = isObjectEqual(formData, initialValuesRef.current);
  const thisVariant = variants.find((v) => v.id === id);
  const otherVariants = variants.filter((v) => v.id !== id);

  const canEditAttributes =
    experimentStatus !== ExperimentStatusesEnum.RUNNING &&
    experimentStatus !== ExperimentStatusesEnum.COMPLETED &&
    !thisVariant.is_control;

  useEffect(() => {
    const totalTraffic = Object.keys(formData).reduce((acc, key) => {
      if (key.startsWith('traffic_')) {
        const value = parseInt(formData[key], 10);
        return !isNaN(value) ? acc + value : acc;
      }
      return acc;
    }, 0);

    if (totalTraffic > 100 || totalTraffic < 100) {
      setErrors(['Toal traffic must be 100%']);
      return;
    }
    setErrors([]);
  }, [formData]);

  const onSave = useCallback(async () => {
    try {
      setSubmitting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/variant/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
          }),
        },
      );
      const data = await response.json();
      console.log(data);
      onClose();
      router.refresh();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  }, [formData, id, router]);

  return (
    <Modal onClose={onClose}>
      <div className={styles.header}>
        <h3 className={styles.title}>Edit Variant {thisVariant.num}</h3>
      </div>
      <div className={styles.fields}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Text:</label>
          <Input
            type="text"
            value={formData?.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            disabled={!canEditAttributes}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Traffic:</label>
          <Input
            type="number"
            value={formData?.[`traffic_${thisVariant.id}`]}
            onChange={(e) =>
              setFormData({
                ...formData,
                [`traffic_${thisVariant.id}`]: e.target.value,
              })
            }
          />
        </div>
        {otherVariants.map((v) => (
          <div className={styles.fieldGroup} key={v.id}>
            <label className={styles.label}>Variant {v.num} Traffic:</label>
            <Input
              type="number"
              value={formData?.[`traffic_${v.id}`]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [`traffic_${v.id}`]: e.target.value,
                })
              }
            />
          </div>
        ))}

        {errors.length > 0 && (
          <div className={styles.errors}>
            {errors.map((e) => (
              <div className={styles.error} key={e}>
                {e}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={styles.actions}>
        <Button
          className={styles.save}
          onClick={onSave}
          disabled={isFormPristine || submitting || errors.length > 0}
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
