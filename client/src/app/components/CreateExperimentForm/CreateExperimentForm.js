import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useStore from '../../store';
import getShortId from '../../helpers/getShortId';
import Check from '../../icons/Check';
import Button from '../Button/Button';
import Delete from '../../icons/Delete';
import { Button as NextUIButton } from '@nextui-org/react';
import Input from '../Input/Input';
import styles from './CreateExperimentForm.module.css';

const CreateExperimentForm = ({ experiment }) => {
  const router = useRouter();
  const variantsCheckIntervalRef = useRef(null);
  const { currentProject, refetchProjects } = useStore();
  const loading = Object.keys(currentProject).length === 0;
  const [createExperimentLoading, setCreateExperimentLoading] = useState(false);
  const [addVariantLoading, setAddVariantLoading] = useState(false);
  const [formState, setFormState] = useState({
    experimentUrl: currentProject.domain
      ? 'https://' + currentProject.domain
      : '',
    experiment,
  });

  useEffect(() => {
    return () => clearInterval(variantsCheckIntervalRef.current);
  }, []);

  async function handleConfirmUrl() {
    setCreateExperimentLoading(true);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STELLAR_API}/experiments`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: currentProject.id,
          name: `Experiment for ${formState.experimentUrl}`,
          url: formState.experimentUrl,
        }),
      },
    );

    const experiment = await response.json();
    toast.success('Experiment created successfully');
    await refetchProjects();
    router.push(`/experiment/create/${experiment.id}`);
    setCreateExperimentLoading(false);
  }

  function handleEditVariant(variantId) {
    window.open(
      `${formState.experiment.url}?stellarMode=true&experimentId=${formState.experiment.id}&variantId=${variantId}&visualEditorOn=true`,
      '_blank',
    );
    variantsCheckIntervalRef.current = setInterval(async () => {
      console.log('interval iter');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experiment.id}`,
      );
      const experimentJson = await res.json();
      const variant = experimentJson.variants.find(
        (variant) => variant.id == variantId,
      );
      console.log('variant encontrada. ', variant);
      if (variant.modifications.length > 0) {
        clearInterval(variantsCheckIntervalRef.current);
        setFormState({
          ...formState,
          experiment: experimentJson,
        });
        toast.success('Variant modified successfully!');
      }
    }, 1500);
  }

  async function handleAddVariant() {
    setAddVariantLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/variant/${experiment.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `Variant ${getShortId()}`,
          }),
        },
      );
      const variant = await response.json();
      setFormState({
        ...formState,
        experiment: {
          ...formState.experiment,
          variants: [...formState.experiment.variants, variant],
        },
      });
      console.log(variant);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add variant');
    }
    setAddVariantLoading(false);
  }

  function handleDeleteVariant(variantId) {
    toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_STELLAR_API}/variant/${variantId}`, {
        method: 'DELETE',
      }),
      {
        loading: 'Deleting variant...',
        success: async () => {
          setFormState({
            ...formState,
            experiment: {
              ...formState.experiment,
              variants: formState.experiment.variants.filter(
                (variant) => variant.id !== variantId,
              ),
            },
          });
          return 'Variant deleted';
        },
      },
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.CreateExperimentForm}>
      <div className={`${styles.fieldGroup} ${styles.step}`}>
        <label className={styles.stepTitle}>
          1. Which URL is this experiment for?
        </label>
        <Input
          className={styles.urlInput}
          type="text"
          name="url"
          placeholder={`https://${currentProject.domain}/your-url`}
          value={formState.experimentUrl || experiment.url}
          onChange={(e) =>
            setFormState({ ...formState, experimentUrl: e.target.value })
          }
          disabled={formState.experiment}
        />
        <span className={styles.hint}>
          Must be part of {currentProject.domain}
        </span>
        <div className={styles.urlAction}>
          {!formState.experiment && (
            <Button
              onClick={handleConfirmUrl}
              loading={createExperimentLoading}
            >
              Confirm URL
            </Button>
          )}
        </div>
      </div>
      {formState.experiment && (
        <div className={`${styles.variants} ${styles.step}`}>
          <div className={styles.stepTitle}>2. Edit your variants</div>
          <div>
            {formState.experiment.variants.map((variant) => (
              <div className={styles.variant} key={variant.id}>
                <div className={styles.cell}>{variant.name}</div>
                <div className={styles.cell}>Weight: {variant.traffic}%</div>
                <div className={styles.cell}>
                  {!variant.is_control && (
                    <span className={styles.changes}>
                      Changes: <span>{variant.modifications?.length || 0}</span>
                    </span>
                  )}
                </div>
                <div className={styles.cell}>
                  {!variant.is_control && (
                    <div className={styles.actions}>
                      <NextUIButton
                        size="sm"
                        className={styles.editButton}
                        variant="flat"
                        color="primary"
                        onPress={() => handleEditVariant(variant.id)}
                      >
                        Edit variant
                      </NextUIButton>
                      <span className="text-lg text-danger cursor-pointer active:opacity-50">
                        <Delete
                          onClick={() => handleDeleteVariant(variant.id)}
                        />
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div className={styles.addVariant}>
              <NextUIButton
                size="sm"
                variant="flat"
                className={styles.addVariantButton}
                // color="primary"
                onPress={handleAddVariant}
                isLoading={addVariantLoading}
                isDisabled={addVariantLoading}
              >
                Add Another Variant
              </NextUIButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExperimentForm;
