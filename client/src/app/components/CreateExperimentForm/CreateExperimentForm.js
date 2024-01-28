'use client';
import { useEffect, useRef, useState } from 'react';
import getShortId from '../../helpers/getShortId';
import Button from '../Button/Button';
import Input from '../Input/Input';
import styles from './CreateExperimentForm.module.css';

const CreateExperimentForm = ({ domain }) => {
  const experimentCreatedCheckInterval = useRef(null);
  const [formData, setFormData] = useState({
    elementUrl: '',
    query_selector: '',
    selection: 'manual_select',
  });

  useEffect(() => {
    return () => clearInterval(experimentCreatedCheckInterval.current);
  }, []);

  function handleSelectElement() {
    const tempId = getShortId();
    window.open(
      `${
        'http://localhost:3002' + '/' + formData.elementUrl
      }?stellarMode=true&newExperiment=true`,
      '_blank&tempId=' + tempId,
    );

    experimentCreatedCheckInterval.current = setInterval(async () => {
      // get experiments, if one contains tempId in its name, then it's been created.
      // if (experimentJson?.goal?.updated_at !== initialGoalUpdatedAt) {
      //   // TODO: trigger global app success toast
      //   onClose();
      //   router.refresh();
      // }
    }, 1000);
  }
  return (
    <div className={styles.CreateExperimentForm}>
      <div className={styles.fieldGroup}>
        <label>Which URL is this experiment for?</label>
        <Input
          type="text"
          name="url"
          placeholder="your-domain.com/your-page"
          value={formData.elementUrl}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
        />
        <span className={styles.hint}>Must be part of [domain]</span>
      </div>
      <div className={styles.fieldGroup}>
        <label>Let's choose the element we will experiment with</label>
        <div className={styles.radioGroup}>
          <div className={styles.radio}>
            <input
              checked={formData.selection === 'query_selector'}
              disabled
              type="radio"
              id="query_selector"
              name="selection"
              value={formData.selection}
              onChange={(e) =>
                setFormData({ ...formData, selection: e.target.value })
              }
            />
            <label htmlFor="query_selector">Provide query selector</label>
          </div>
          <div className={styles.radio}>
            <input
              checked={formData.selection === 'manual_select'}
              type="radio"
              id="manual_select"
              name="selection"
              value={formData.selection}
              onChange={(e) =>
                setFormData({ ...formData, selection: e.target.value })
              }
            />
            <label htmlFor="manual_select">Select manually</label>
          </div>
        </div>
        <Button
          className={styles.selectElementBtn}
          onClick={handleSelectElement}
        >
          Select Element
        </Button>
      </div>
    </div>
  );
};

export default CreateExperimentForm;
