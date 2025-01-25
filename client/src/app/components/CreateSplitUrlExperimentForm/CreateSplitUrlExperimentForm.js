import { useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Switch, Button as NextUIButton, Tooltip } from '@nextui-org/react';
import useStore from '../../store';
import Delete from '../../icons/Delete';
import Input from '../Input/Input';
import Button from '../Button/Button';
import styles from './CreateSplitUrlExperimentForm.module.css';
import TargetAudienceForm from '../TargetAudienceForm';
import isUrlFromDomain from '../../helpers/isUrlFromDomain';
import Info from '../../icons/Info/Info';

const CreateSplitUrlExperimentForm = ({ experimentId }) => {
  const router = useRouter();
  const { currentProject, refetchProjects } = useStore();
  const experiment =
    currentProject?.experiments?.find((e) => e.id == experimentId) || null;
  const targetRules = experiment?.targetRules?.[0]?.rules || null;

  const [loading, setLoading] = useState(false);
  const [showTargetAudienceForm, setShowTargetAudienceForm] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [variants, setVariants] = useState([
    { url: '', preserve_url_params: true },
  ]);

  const handleAddVariant = () => {
    if (variants.length >= 10) {
      toast.error('Maximum 10 variants allowed');
      return;
    }
    setVariants([
      ...variants,
      { url: `https://${currentProject.domain}/`, preserve_url_params: true },
    ]);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length <= 1) return;
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const isFormValid = () => {
    const isBaseUrlValid = isUrlFromDomain(baseUrl, currentProject.domain);
    const areVariantsValid = variants.every(
      (variant) =>
        isUrlFromDomain(variant.url, currentProject.domain) &&
        variant.url.trim() !== '',
    );
    return isBaseUrlValid && areVariantsValid;
  };

  const areUrlsSet = () => {
    const isBaseUrlSet =
      baseUrl.trim() !== '' && isUrlFromDomain(baseUrl, currentProject.domain);
    const isVariantUrlSet = variants.some(
      (variant) =>
        variant.url.trim() !== '' &&
        isUrlFromDomain(variant.url, currentProject.domain),
    );
    return isBaseUrlSet && isVariantUrlSet;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        type: 'SPLIT_URL',
        projectId: currentProject.id,
        baseUrl,
        variants: variants.map((variant) => ({
          url: variant.url,
          preserve_url_params: variant.preserve_url_params,
        })),
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiments/split-url`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      const newExperiment = await response.json();
      await refetchProjects();
      toast.success('URL split test created successfully');
      router.push(`/experiment/${newExperiment.id}`);
    } catch (error) {
      toast.error('Failed to create URL split test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createSplitUrlForm}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Enter your base URL</h2>
        <Input
          type="text"
          placeholder={`https://${currentProject.domain}/your-url`}
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          className={styles.urlInput}
        />
        <div className={styles.hint}>
          Must be part of{' '}
          <a
            href={`https://${currentProject.domain}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {currentProject.domain}
          </a>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          2. Enter the URLs for your variants
        </h2>
        {variants.map((variant, index) => (
          <div key={index} className={styles.variantRow}>
            <Input
              type="text"
              placeholder={`https://${currentProject.domain}/variant-url`}
              value={variant.url}
              onChange={(e) =>
                handleVariantChange(index, 'url', e.target.value)
              }
              className={styles.urlInput}
            />
            <div className={styles.variantControls}>
              <div className="flex items-center gap-1">
                <Switch
                  size="sm"
                  isSelected={variant.preserve_url_params}
                  onValueChange={(checked) =>
                    handleVariantChange(index, 'preserve_url_params', checked)
                  }
                >
                  Preserve URL parameters
                </Switch>
                <Tooltip
                  content={
                    <div className={styles.tooltipContent}>
                      If enabled, any URL parameters (query string) from the
                      original page will be added to this variant's URL. For
                      example, if someone visits "yoursite.com/page
                      <span className={styles.highlight}>?ref=email</span>",
                      they'll be redirected to "yoursite.com/variant
                      <span className={styles.highlight}>?ref=email</span>".
                    </div>
                  }
                  showArrow
                  closeDelay={200}
                  className={styles.tooltip}
                >
                  <div>
                    <Info />
                  </div>
                </Tooltip>
              </div>
              {variants.length > 1 && (
                <Delete
                  className={styles.deleteIcon}
                  onClick={() => handleRemoveVariant(index)}
                />
              )}
            </div>
          </div>
        ))}
        <NextUIButton
          size="sm"
          variant="flat"
          onPress={handleAddVariant}
          className={styles.addVariantButton}
        >
          + Add Variant URL
        </NextUIButton>
      </div>

      {areUrlsSet() && (
        <div className={styles.section}>
          <div className={styles.targetingHeader}>
            <h2 className={styles.sectionTitle}>3. Target Audience</h2>
          </div>
          <>
            <Switch
              size="sm"
              isSelected={showTargetAudienceForm}
              onValueChange={setShowTargetAudienceForm}
            >
              Advanced Targeting Rules
            </Switch>
            {showTargetAudienceForm && (
              <TargetAudienceForm
                experimentId={experimentId}
                targetRules={targetRules}
                saveButtonLabel="Set Targeting Rules"
              />
            )}
          </>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!isFormValid()}
        >
          Create Split URL Test
        </Button>
      </div>
    </div>
  );
};

export default CreateSplitUrlExperimentForm;
