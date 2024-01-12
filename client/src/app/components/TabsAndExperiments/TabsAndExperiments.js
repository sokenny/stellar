'use client';

import { useState } from 'react';
import Experiment from '../Experiment/Experiment';
import styles from './TabsAndExperiments.module.css';

const tabs = ['Running', 'Queued', 'Draft', 'Completed'];

const TabsAndExperiments = ({ experiments }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const experimentsByTab = {
    [tabs[0]]: experiments.filter(
      (experiment) =>
        experiment.started_at !== null && experiment.ended_at === null,
    ),
    [tabs[1]]: experiments.filter(
      (experiment) => experiment.started_at === null,
    ),
    [tabs[2]]: experiments.filter(
      (experiment) => experiment.started_at === null,
    ),
    [tabs[3]]: experiments.filter((experiment) => experiment.ended_at !== null),
  };

  return (
    <div className={styles.TabsAndExperiments}>
      <div className={styles.tabs}>
        {tabs.map((tab, i) => (
          <div
            key={tab}
            className={`${styles.tab} ${
              tab === activeTab ? styles.active : ''
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      <div className={styles.experiments}>
        <h2 className={styles.title}>{activeTab} Experiments</h2>
        <div className={styles.experiments}>
          {experimentsByTab[activeTab].map((experiment) => (
            <Experiment key={experiment.id} experiment={experiment} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabsAndExperiments;
