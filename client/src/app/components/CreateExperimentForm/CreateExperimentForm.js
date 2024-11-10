import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useStore from '../../store';
import getShortId from '../../helpers/getShortId';
import useVariantEditor from '../../helpers/useVariantEditor';
import isUrlFromDomain from '../../helpers/isUrlFromDomain';
import SnippetInstallationModal from '../Modals/SnippetInstallationModal';
import Button from '../Button/Button';
import Delete from '../../icons/Delete';
import { Button as NextUIButton, useDisclosure } from '@nextui-org/react';
import Input from '../Input/Input';
import styles from './CreateExperimentForm.module.css';

const CreateExperimentForm = ({ experimentId }) => {
  const router = useRouter();
  const variantsCheckIntervalRef = useRef(null);
  const { user, currentProject, refetchProjects } = useStore();
  const experiment =
    currentProject?.experiments?.find((e) => e.id == experimentId) || null;
  const missingSnippet = currentProject?.snippet_status !== 1;
  const loading = user === null || !currentProject;
  const [createExperimentLoading, setCreateExperimentLoading] = useState(false);
  const [addVariantLoading, setAddVariantLoading] = useState(false);
  const [formState, setFormState] = useState({
    experimentUrl: currentProject.domain
      ? 'https://' + currentProject.domain
      : '',
    experiment,
  });
  const {
    isOpen: isSnippetModalOpen,
    onOpen: onOpenSnippetModal,
    onOpenChange: onOpenSnippetModalChange,
  } = useDisclosure();

  useEffect(() => {
    return () => clearInterval(variantsCheckIntervalRef.current);
  }, []);

  async function handleConfirmUrl() {
    setCreateExperimentLoading(true);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiments`,
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

  const { handleEditVariant } = useVariantEditor({ experiment });

  const onVariantModified = (experiment) => {
    setFormState({
      ...formState,
      experiment,
    });
  };

  async function handleAddVariant() {
    setAddVariantLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/variant/${experiment.id}`,
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
      refetchProjects();

      console.log(variant);
    } catch (error) {
      console.error(error);
      toast.error('Failed to add variant');
    }
    setAddVariantLoading(false);
  }

  function handleDeleteVariant(variantId) {
    toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_STELLAR_API}/api/variant/${variantId}`, {
        method: 'DELETE',
      }),
      {
        loading: 'Deleting variant...',
        success: async () => {
          await refetchProjects();
          return 'Variant deleted';
        },
      },
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <SnippetInstallationModal
        isOpen={isSnippetModalOpen}
        onOpenChange={onOpenSnippetModalChange}
      />
      <div className={styles.CreateExperimentForm}>
        <div className={`${styles.fieldGroup} ${styles.step}`}>
          <label className={styles.stepTitle}>
            1. Which URL is this experiment for?
          </label>
          <Input
            className={styles.urlInput}
            type="text"
            name="url"
            placeholder={`${
              process.env.NODE_ENV === 'development' ? 'http' : 'https'
            }://${currentProject.domain}/your-url`}
            value={formState.experimentUrl || experiment.url}
            onChange={(e) =>
              setFormState({ ...formState, experimentUrl: e.target.value })
            }
            disabled={formState.experiment}
          />
          <span className={styles.hint}>
            Must be part of {currentProject.domain}
          </span>
          {!formState.experiment && (
            <div className={styles.urlAction}>
              <Button
                onClick={handleConfirmUrl}
                loading={createExperimentLoading}
                disabled={
                  !isUrlFromDomain(
                    formState.experimentUrl,
                    currentProject.domain,
                  )
                }
              >
                Confirm URL
              </Button>
            </div>
          )}
        </div>
        {experiment && (
          <div>
            <div className={`${styles.variants} ${styles.step}`}>
              <div className={styles.stepTitle}>2. Edit your variants</div>
              <div>
                {experiment.variants
                  .slice()
                  .sort((a, b) => a.id - b.id)
                  .map((variant) => (
                    <div className={styles.variant} key={variant.id}>
                      <div className={styles.cell}>{variant.name}</div>
                      <div className={`${styles.cell} ${styles.weight}`}>
                        Weight: {variant.traffic}%
                      </div>
                      <div className={styles.cell}>
                        {!variant.is_control && (
                          <span className={styles.changes}>
                            Changes:{' '}
                            <span>{variant.modifications?.length || 0}</span>
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
                              onPress={() =>
                                missingSnippet
                                  ? onOpenSnippetModal()
                                  : handleEditVariant(
                                      variant.id,
                                      onVariantModified,
                                    )
                              }
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
                    onPress={handleAddVariant}
                    isLoading={addVariantLoading}
                    isDisabled={addVariantLoading}
                  >
                    Add Another Variant
                  </NextUIButton>
                </div>
              </div>
            </div>
            <div className={styles.actions}>
              <Button
                onClick={() => router.push(`/experiment/${experiment.id}`)}
              >
                Go to Experiment
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CreateExperimentForm;
