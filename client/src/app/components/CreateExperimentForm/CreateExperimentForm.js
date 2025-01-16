import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useStore from '../../store';
import getShortId from '../../helpers/getShortId';
import useVariantEditor from '../../helpers/useVariantEditor';
import SnippetInstallationModal from '../Modals/SnippetInstallationModal';
import Button from '../Button/Button';
import Delete from '../../icons/Delete';
import {
  Button as NextUIButton,
  useDisclosure,
  Switch,
} from '@nextui-org/react';
import TargetAudienceForm from '../TargetAudienceForm';
import ExperimentUrlRules from '../ExperimentUrlRules';
import styles from './CreateExperimentForm.module.css';
import ExperimentEditorUrl from '../ExperimentEditorUrl/ExperimentEditorUrl';

const CreateExperimentForm = ({ experimentId }) => {
  const router = useRouter();
  const variantsCheckIntervalRef = useRef(null);
  const { user, currentProject, refetchProjects } = useStore();
  const experiment =
    currentProject?.experiments?.find((e) => e.id == experimentId) || null;
  const targetRules = experiment?.targetRules?.[0]?.rules || null;
  const missingSnippet = currentProject?.snippet_status !== 1;
  const loading = user === null || !currentProject;
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
  const [showTargetAudienceForm, setShowTargetAudienceForm] = useState(false);
  const [editorUrlError, setEditorUrlError] = useState(false);

  useEffect(() => {
    return () => clearInterval(variantsCheckIntervalRef.current);
  }, []);

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
      toast.success('Variant added successfully');
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

  const handleEditVariantClick = (variantId) => {
    if (!experiment.editor_url) {
      setEditorUrlError(true);
      const element = document.querySelector(`#experiment-editor-url`);
      const elementPosition = element.getBoundingClientRect().top;
      const offset = window.innerHeight / 4; // This will offset by 1/4 of the viewport height

      window.scrollTo({
        top: window.scrollY + elementPosition - offset,
        behavior: 'smooth',
      });
      return;
    }

    missingSnippet
      ? onOpenSnippetModal()
      : handleEditVariant(variantId, onVariantModified);
  };

  const shouldShowRemainingSteps = experiment?.editor_url;

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <SnippetInstallationModal
        isOpen={isSnippetModalOpen}
        onOpenChange={onOpenSnippetModalChange}
      />
      <div className={styles.CreateExperimentForm}>
        <div className={`${styles.fieldGroup} ${styles.step}`}>
          <ExperimentUrlRules
            className={styles.advancedUrlRules}
            onExperimentUrlChange={(url) =>
              setFormState({ ...formState, experimentUrl: url })
            }
            experiment={experiment}
            isCreatePage={true}
          />
        </div>
        {experiment && (
          <div>
            <div className={`${styles.step}`}>
              <ExperimentEditorUrl
                experiment={experiment}
                onSuccess={() => {
                  setEditorUrlError(false);
                }}
                error={
                  editorUrlError
                    ? 'Please set an editor URL before editing variants'
                    : null
                }
              />
            </div>
            {shouldShowRemainingSteps ? (
              <>
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
                                <span>
                                  {variant.modifications?.length || 0}
                                </span>
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
                                    handleEditVariantClick(variant.id)
                                  }
                                >
                                  Edit variant
                                </NextUIButton>
                                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                  <Delete
                                    onClick={() =>
                                      handleDeleteVariant(variant.id)
                                    }
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

                <div className={`${styles.variants} ${styles.step}`}>
                  <div className={styles.stepHeader}>
                    <div className={styles.texts}>
                      <div
                        className={`${styles.stepTitle} ${styles.targetaudience}`}
                      >
                        3. Target your audience
                      </div>
                      {!showTargetAudienceForm && (
                        <div className={styles.stepLegend}>
                          Currently set to all users
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.advancedTargetingRulesSwitch}>
                    <Switch
                      size="sm"
                      isSelected={showTargetAudienceForm}
                      onValueChange={setShowTargetAudienceForm}
                    >
                      Advanced Targeting Rules
                    </Switch>
                  </div>
                  {showTargetAudienceForm && (
                    <TargetAudienceForm
                      experimentId={experimentId}
                      saveButtonLabel="Set Targeting Rules"
                      onSuccess={() => {
                        router.push(`/experiment/${experiment.id}`);
                      }}
                      targetRules={targetRules}
                    />
                  )}
                </div>
                <div className={styles.actions}>
                  <Button
                    onClick={() => router.push(`/experiment/${experiment.id}`)}
                  >
                    Go to Experiment
                  </Button>
                  <br />
                </div>
                <div className={styles.furtherEdits}>
                  You can still make further edits afterwards.
                </div>
              </>
            ) : (
              <div className={styles.step}>
                Please set a Visual Editor URL to continue setting up your
                experiment.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default CreateExperimentForm;
