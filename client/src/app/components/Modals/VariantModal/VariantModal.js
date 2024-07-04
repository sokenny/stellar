import { toast } from 'sonner';
import { useCallback, useState, useRef, useEffect } from 'react';
import {
  Button as NextUIButton,
  Divider,
  useDisclosure,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import useStore from '../../../store';
import isObjectEqual from '../../../helpers/isObjectEqual';
import Input from '../../Input/Input';
import Modal from '../Modal/Modal';
import Button from '../../Button/Button';
import useVariantEditor from '../../../helpers/useVariantEditor';
import styles from './VariantModal.module.css';
import SnippetInstallationModal from '../SnippetInstallationModal';

const VariantModal = ({
  onClose,
  id,
  experiment,
  variants,
  initialValues = {
    text: '',
  },
}) => {
  const router = useRouter();
  const { refetchProjects, currentProject } = useStore();
  const missingSnippet = currentProject.snippet_status !== 1;
  const initialValuesRef = useRef(initialValues);
  const [formData, setFormData] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const isFormPristine = isObjectEqual(formData, initialValuesRef.current);
  const thisVariant = variants.find((v) => v.id === id);
  const otherVariants = variants.filter((v) => v.id !== id);
  const { handleEditVariant } = useVariantEditor({ experiment });
  const {
    isOpen: isSnippetModalOpen,
    onOpen: onOpenSnippetModal,
    onOpenChange: onOpenSnippetModalChange,
  } = useDisclosure();

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
      const apiPath = `/api/variant/${id}`;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}${apiPath}`,
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
      console.log('response', response);
      if (response.status === 200) {
        console.log('SI PA');
        refetchProjects();
        toast.success(`Variant updated`);
        onClose();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  }, [formData, id, router]);

  return (
    <>
      <SnippetInstallationModal
        isOpen={isSnippetModalOpen}
        onOpenChange={onOpenSnippetModalChange}
      />
      <Modal onClose={onClose}>
        <div className={styles.header}>
          <h3 className={styles.title}>Edit Variant {thisVariant.num}</h3>
        </div>
        <div className={styles.fields}>
          {!thisVariant.is_control && (
            <div className={styles.fieldGroup}>
              <label className={`${styles.label} ${styles.changes}`}>
                Changes: <span>({thisVariant.modifications.length})</span>
              </label>
              <div>
                <NextUIButton
                  size="sm"
                  className={styles.editOnWeb}
                  variant="flat"
                  color="primary"
                  onPress={() =>
                    missingSnippet
                      ? onOpenSnippetModal()
                      : handleEditVariant(thisVariant.id)
                  }
                >
                  Edit on website
                </NextUIButton>
              </div>
            </div>
          )}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Name:</label>

            <div>
              <Input
                type="text"
                className={styles.textInput}
                value={formData?.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
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
          <Divider className="my-4" />
          {otherVariants.map((v) => (
            <div className={styles.fieldGroup} key={v.id}>
              <label className={styles.label}>{v.name} Traffic:</label>
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
    </>
  );
};

export default VariantModal;
