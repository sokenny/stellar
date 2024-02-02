'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import Experiment from '../Experiment/Experiment';
import CreateButton from '../CreateButton';
import styles from './TabsAndExperiments.module.css';

const tabs = ['Running', 'Queued', 'Draft', 'Completed'];

const TabsAndExperiments = ({ experiments }) => {
  const router = useRouter();
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
      <div className={styles.navigation}>
        <div className={styles.createNewExperiment}>
          <CreateButton onClick={() => router.push('/experiment/create')} />
        </div>
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
      </div>
      <div>
        <h2 className={styles.title}>
          {activeTab} Experiments -<span onClick={signOut}>logout</span>
        </h2>
        <div className={styles.experiments}>
          {experimentsByTab[activeTab].map((experiment) => (
            <Experiment key={experiment.id} experiment={experiment} cardLike />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabsAndExperiments;
