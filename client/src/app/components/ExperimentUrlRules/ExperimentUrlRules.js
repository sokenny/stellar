import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Switch,
  Select,
  SelectItem,
  Button as NextUIButton,
  Tooltip,
} from '@nextui-org/react';
import { toast } from 'sonner';
import Input from '../Input/Input';
import Trash from '../../icons/Trash/Trash';
import styles from './ExperimentUrlRules.module.css';
import useStore from '../../store';
import Button from '../Button';
import isUrlFromDomain from '../../helpers/isUrlFromDomain';

const ExperimentUrlRules = ({
  className,
  experiment,
  onSuccess,
  disabledEditing,
}) => {
  const [urlRules, setUrlRules] = useState({
    include: [{ type: 'exact', url: '' }],
    exclude: [{ type: 'exact', url: '' }],
  });

  const { currentProject, refetchProjects } = useStore();
  const [experimentUrl, setExperimentUrl] = useState(
    experiment ? experiment.url : `https://${currentProject.domain}`,
  );
  const [advancedUrlRules, setAdvancedUrlRules] = useState(
    experiment?.advanced_url_rules ? true : false,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (experiment?.advanced_url_rules) {
      setUrlRules(experiment.advanced_url_rules);
    }
  }, [experiment]);

  const handleAddUrl = (category) => {
    if (urlRules[category].length >= 10) {
      toast.error('Maximum 10 URLs allowed');
      return;
    }
    setUrlRules({
      ...urlRules,
      [category]: [...urlRules[category], { type: 'exact', url: '' }],
    });
  };

  const handleUrlChange = (category, index, field, value) => {
    const newRules = [...urlRules[category]];
    newRules[index] = { ...newRules[index], [field]: value };
    setUrlRules({ ...urlRules, [category]: newRules });
  };

  const handleRemoveUrl = (category, index) => {
    if (urlRules[category].length <= 1) {
      return;
    }
    const newRules = [...urlRules[category]];
    newRules.splice(index, 1);
    setUrlRules({ ...urlRules, [category]: newRules });
  };

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = {
        url: advancedUrlRules ? '' : experimentUrl,
        advanced_url_rules: advancedUrlRules ? urlRules : null,
        type: 'AB',
      };

      let newExperiment;

      // If experiment exists, update it
      if (experiment) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experiment.id}/url-rules`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          },
        );
        await response.json();
        toast.success('Experiment URL rules updated successfully');
      } else {
        // Create new experiment
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiments`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...payload,
              projectId: currentProject.id,
            }),
          },
        );
        newExperiment = await response.json();
        toast.success('Experiment created successfully');
      }

      await refetchProjects();
      onSuccess && onSuccess(newExperiment.id);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save URL rules');
    } finally {
      setLoading(false);
    }
  }

  const isFormValid = () => {
    if (!advancedUrlRules) {
      return isUrlFromDomain(experimentUrl, currentProject.domain);
    }
    // Check if there's at least one include rule with a non-empty URL
    return urlRules.include.some((rule) => rule.url.trim() !== '');
  };

  const isPristine = experiment
    ? !advancedUrlRules
      ? experiment.url === experimentUrl
      : JSON.stringify(experiment.advanced_url_rules) ===
        JSON.stringify(urlRules)
    : true;

  const disabledSubmission = () => {
    if (experiment) {
      return !isFormValid() || isPristine;
    }
    return !isFormValid();
  };

  return (
    <div className={styles.experimentUrlRules}>
      <label className={styles.title}>
        1. Which URL is this experiment for?
      </label>
      <Tooltip
        content="Advanced URL rules are enabled."
        showArrow
        className={styles.tooltip}
        closeDelay={200}
        isDisabled={!advancedUrlRules}
      >
        <span>
          <Input
            className={styles.urlInput}
            type="text"
            name="url"
            placeholder={`${
              process.env.NODE_ENV === 'development' ? 'http' : 'https'
            }://${currentProject.domain}/your-url`}
            value={advancedUrlRules ? '' : experimentUrl}
            onChange={(e) => setExperimentUrl(e.target.value)}
            disabled={disabledEditing || advancedUrlRules}
          />
        </span>
      </Tooltip>
      <div className={styles.urlSettings}>
        <span className={styles.hint}>
          Must be part of{' '}
          <a
            href={`https://${currentProject.domain}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {currentProject.domain}
          </a>
        </span>
        <div className={styles.advancedUrlRulesSwitch}>
          <Switch
            size="sm"
            onChange={(e) => setAdvancedUrlRules(e.target.checked)}
            isSelected={advancedUrlRules}
            isDisabled={disabledEditing}
          >
            Advanced URL Rules
          </Switch>
        </div>
      </div>
      {advancedUrlRules && (
        <div className={`${styles.advancedUrlRules} ${className}`}>
          <div className={styles.urlRulesSection}>
            <h4>✅ Run experiment on ANY of these pages:</h4>
            {urlRules.include.map((rule, index) => (
              <div key={index} className={styles.urlRule}>
                <Select
                  size="sm"
                  selectedKeys={[rule.type]}
                  onChange={(e) =>
                    handleUrlChange('include', index, 'type', e.target.value)
                  }
                  className="w-40"
                  aria-label="URL match type for include rule"
                  isDisabled={disabledEditing}
                >
                  <SelectItem key="exact">Exact match</SelectItem>
                  <SelectItem key="contains">Contains</SelectItem>
                </Select>
                <Input
                  value={rule.url}
                  onChange={(e) =>
                    handleUrlChange('include', index, 'url', e.target.value)
                  }
                  placeholder="https://example.com"
                  disabled={disabledEditing}
                />
                {urlRules.include.length > 1 && (
                  <Trash
                    height={20}
                    width={20}
                    onClick={() => handleRemoveUrl('include', index)}
                  />
                )}
              </div>
            ))}
            <NextUIButton
              size="sm"
              variant="light"
              onPress={() => handleAddUrl('include')}
              isDisabled={urlRules.exclude.length >= 10 || disabledEditing}
            >
              + Add URL
            </NextUIButton>
          </div>

          <div className={styles.urlRulesSection}>
            <h4>⛔ Never run experiment on these pages:</h4>
            {urlRules.exclude.map((rule, index) => (
              <div key={index} className={styles.urlRule}>
                <Select
                  size="sm"
                  selectedKeys={[rule.type]}
                  onChange={(e) =>
                    handleUrlChange('exclude', index, 'type', e.target.value)
                  }
                  className="w-40"
                  aria-label="URL match type for exclude rule"
                  isDisabled={disabledEditing}
                >
                  <SelectItem key="exact">Exact match</SelectItem>
                  <SelectItem key="contains">Contains</SelectItem>
                </Select>
                <Input
                  value={rule.url}
                  onChange={(e) =>
                    handleUrlChange('exclude', index, 'url', e.target.value)
                  }
                  placeholder="https://example.com"
                  disabled={disabledEditing}
                />
                {urlRules.exclude.length > 1 && (
                  <Trash
                    height={20}
                    width={20}
                    onClick={() => handleRemoveUrl('exclude', index)}
                  />
                )}
              </div>
            ))}
            <NextUIButton
              size="sm"
              onPress={() => handleAddUrl('exclude')}
              isDisabled={urlRules.exclude.length >= 10 || disabledEditing}
              variant="light"
            >
              + Add URL
            </NextUIButton>
          </div>
        </div>
      )}
      {!disabledEditing && (
        <div className={styles.urlAction}>
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={disabledSubmission()}
          >
            {advancedUrlRules ? 'Confirm URL Rules' : 'Confirm URL'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExperimentUrlRules;
