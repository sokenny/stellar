import { toast } from 'sonner';
import { useCallback, useState, useRef, useEffect } from 'react';
import { Tooltip } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import useStore from '../../../store';
import isObjectEqual from '../../../helpers/isObjectEqual';
import ExperimentStatusesEnum from '../../../helpers/enums/ExperimentStatusesEnum';
import Input from '../../Input/Input';
import Modal from '../Modal/Modal';
import Button from '../../Button/Button';
import styles from './VariantModal.module.css';

const VariantModal = ({
  isEditing = true,
  onClose,
  id,
  experiment,
  variants,
  initialValues = {
    text: '',
  },
}) => {
  const router = useRouter();
  const { refetchProjects } = useStore();
  const initialValuesRef = useRef(initialValues);
  const [formData, setFormData] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [isControlTooltipOpen, setIsControlTooltipOpen] = useState(false);
  const isFormPristine = isObjectEqual(formData, initialValuesRef.current);
  const thisVariant = isEditing ? variants.find((v) => v.id === id) : {};
  const otherVariants = variants.filter((v) => v.id !== id);

  console.log('isControlTooltipOpen: ', isControlTooltipOpen);

  const canEditAttributes =
    experiment.status !== ExperimentStatusesEnum.RUNNING &&
    experiment.status !== ExperimentStatusesEnum.COMPLETED &&
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
      const apiPath = isEditing ? `/variant/${id}` : '/variant';
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}${apiPath}`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            ...(!isEditing && { experimentId: experiment.id }),
          }),
        },
      );
      if (response.status === 200) {
        refetchProjects();
        toast.success(
          `Variant ${isEditing ? 'updated' : 'created'} successfully`,
        );
        onClose();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  }, [formData, id, router]);

  return (
    <Modal onClose={onClose}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {isEditing ? 'Edit' : 'Create'} Variant {thisVariant.num}
        </h3>
      </div>
      <div className={styles.fields}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Text:</label>
          <Tooltip
            isOpen={isControlTooltipOpen}
            showArrow
            onOpenChange={(open) =>
              setIsControlTooltipOpen(thisVariant.is_control ? open : false)
            }
            content="You can not edit the content of a control variant."
            className={styles.controlTooltip}
            closeDelay={0}
            disableAnimation
          >
            <div>
              <Input
                type="text"
                className={styles.textInput}
                value={formData?.text}
                onChange={(e) =>
                  setFormData({ ...formData, text: e.target.value })
                }
                disabled={!canEditAttributes}
                onMouseEnter={() => setIsControlTooltipOpen(true)}
                onMouseLeave={() => setIsControlTooltipOpen(false)}
              />
            </div>
          </Tooltip>
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

export default VariantModal;
