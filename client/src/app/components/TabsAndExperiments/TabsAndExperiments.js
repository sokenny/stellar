'use client';

import { useState } from 'react';
import useStore from '../../store';
import { useRouter } from 'next/navigation';
import { Tooltip } from '@nextui-org/react';
import segmentTrack from '../../helpers/segment/segmentTrack';
import ExperimentsTable from '../ExperimentsTable';
import CreateButton from '../CreateButton';
import styles from './TabsAndExperiments.module.css';

const tabs = ['Active', 'Draft', 'Ended', 'All'];

const TabsAndExperiments = ({ experiments }) => {
  const router = useRouter();
  const { fetchEndedExperiments } = useStore();
  const [activeTab, setActiveTab] = useState(tabs[0]);

  experiments.sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const experimentsByTab = {
    [tabs[0]]: experiments.filter(
      (experiment) => experiment.started_at && !experiment.ended_at,
    ),
    [tabs[1]]: experiments.filter(
      (experiment) => !experiment.ended_at && !experiment.started_at,
    ),
    [tabs[2]]: experiments.filter(
      (experiment) => experiment.ended_at && experiment.started_at,
    ),
    [tabs[3]]: experiments,
  };

  return (
    <div className={styles.TabsAndExperiments}>
      <div>
        <div className={styles.tableHeader}>
          <div className={styles.colLeft}>
            <h2 className={styles.title}>
              {activeTab} Experiments ({experimentsByTab[activeTab].length})
            </h2>
            <Tooltip
              content={'Create new experiment'}
              showArrow
              className={styles.tooltip}
              closeDelay={0}
            >
              <div className={styles.createNewExperiment}>
                <CreateButton
                  onClick={() => {
                    router.push('/experiment/create');
                    segmentTrack('click_create_new_experiment');
                  }}
                />
              </div>
            </Tooltip>
          </div>
          <div className={styles.navigation}>
            <div className={styles.tabs}>
              {tabs.map((tab, i) => (
                <div
                  key={tab}
                  className={`${styles.tab} ${
                    tab === activeTab ? styles.active : ''
                  }`}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === 'Ended') {
                      fetchEndedExperiments();
                    }
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.experiments}>
          <ExperimentsTable experiments={experimentsByTab[activeTab]} />
        </div>
      </div>
    </div>
  );
};

export default TabsAndExperiments;
