'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import getShortId from '../../helpers/getShortId';
import Check from '../../icons/Check';
import useStore from '../../store';
import Button from '../Button/Button';
import Input from '../Input/Input';
import styles from './CreateExperimentForm.module.css';

const CreateExperimentForm = () => {
  const { currentProject } = useStore();
  const loading = Object.keys(currentProject).length === 0;
  const experimentCreatedCheckInterval = useRef(null);
  const [formState, setFormState] = useState({
    elementUrl: '',
    query_selector: '',
    selection: 'manual_select',
    experiment: null,
  });

  useEffect(() => {
    return () => clearInterval(experimentCreatedCheckInterval.current);
  }, []);

  const handleSelectElement = useCallback(() => {
    const tempId = getShortId();
    window.open(
      `${formState.elementUrl}?stellarMode=true&newExperiment=true&tempId=${tempId}&projectId=${currentProject.id}`,
      '_blank',
    );

    experimentCreatedCheckInterval.current = setInterval(async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/projects/${currentProject.id}/experiments`,
      );
      const experiments = await response.json();
      const newExperiment = experiments.find((experiment) =>
        experiment.name.includes(tempId),
      );

      if (newExperiment) {
        // show element info in the form
        setFormState({
          ...formState,
          experiment: newExperiment,
        });
        clearInterval(experimentCreatedCheckInterval.current);
      }
    }, 2000);
  }, [currentProject.id, formState]);

  return (
    <div className={styles.CreateExperimentForm}>
      <div className={styles.fieldGroup}>
        <label>Which URL is this experiment for?</label>
        <Input
          type="text"
          name="url"
          placeholder={`https://${currentProject.domain}/your-url`}
          value={formState.elementUrl}
          onChange={(e) =>
            setFormState({ ...formState, elementUrl: e.target.value })
          }
        />
        <span className={styles.hint}>
          Must be part of {currentProject.domain}
        </span>
      </div>
      <div className={styles.fieldGroup}>
        <label>Let's choose the element we will experiment with</label>
        <div className={styles.radioGroup}>
          <div className={styles.radio}>
            <input
              checked={formState.selection === 'query_selector'}
              disabled
              type="radio"
              id="query_selector"
              name="selection"
              value={formState.selection}
              onChange={(e) =>
                setFormState({ ...formState, selection: e.target.value })
              }
            />
            <label htmlFor="query_selector">Provide query selector</label>
          </div>
          <div className={styles.radio}>
            <input
              checked={formState.selection === 'manual_select'}
              type="radio"
              id="manual_select"
              name="selection"
              value={formState.selection}
              onChange={(e) =>
                setFormState({ ...formState, selection: e.target.value })
              }
            />
            <label htmlFor="manual_select">Select manually</label>
          </div>
        </div>

        {!formState.experiment ? (
          <Button
            className={styles.selectElementBtn}
            onClick={handleSelectElement}
            disabled={loading}
          >
            Select Element
          </Button>
        ) : (
          <div className={styles.elementInfo}>
            <Check height={16} width={16} className={styles.checkIcon} />
            <a
              href={`${formState.experiment.url}?stellarMode=true&elementToHighlight=${formState.experiment.element.selector}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Element: </span>
              {formState.experiment.element.type} type selected
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateExperimentForm;
