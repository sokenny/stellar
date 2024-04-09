'use client';
import React, { useState } from 'react';
import VariantsTable from '../../components/VariantsTable/VariantsTable';
import useStore from '../../store';
import Notifications from '../Notifications';
import GoalSetupModal from '../../components/Modals/GoalSetupModal/GoalSetupModal';
import InfoCard from '../../components/InfoCard';
import Button from '../../components/Button';
import Header from './Header';
import styles from './page.module.css';

export default function ExperimentPage({ params, searchParams }) {
  const [showSetUpGoalModal, setShowSetUpGoalModal] = useState(false);
  const experimentId = params.id;
  const { currentProject } = useStore();
  const loading = Object.keys(currentProject).length === 0;
  const experiment = currentProject?.experiments?.find(
    (e) => e.id == experimentId,
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  const { goal } = experiment;
  const hasCeroChanges = experiment.variants.every(
    (variant) => variant.modifications?.length === 0,
  );

  console.log('hasCeroChanges: ', hasCeroChanges);

  return (
    <div className={styles.Experiment}>
      <Notifications searchParams={searchParams} />
      <Header experiment={experiment} className={styles.header} />
      <div className={styles.infoSection}>
        {!experiment.goal && (
          <InfoCard className={styles.setGoalCard}>
            {
              <div className={styles.cardBody}>
                <div>Set up a goal before launching your experiment.</div>
                <div>
                  <Button onClick={() => setShowSetUpGoalModal(true)}>
                    Set Up Goal
                  </Button>
                </div>
              </div>
            }
          </InfoCard>
        )}
        {hasCeroChanges && (
          <InfoCard className={styles.setGoalCard}>
            {
              <div className={styles.cardBody}>
                <div>
                  Modify at least one variant before launching your experiment.
                </div>
              </div>
            }
          </InfoCard>
        )}
      </div>
      <section>
        {/* <h3 className={styles.sectionTitle}>Variants</h3> */}
        <VariantsTable variants={experiment.variants} experiment={experiment} />
      </section>
      {showSetUpGoalModal && (
        <GoalSetupModal
          experiment={experiment}
          onClose={() => setShowSetUpGoalModal(false)}
          goal={goal}
        />
      )}
      {/* <Experiment experiment={experiment} open={true} /> */}
      {/* TODO-p2: Work on modal right before "launch journey" that sets up the user's account & paypal sub */}
    </div>
  );
}
