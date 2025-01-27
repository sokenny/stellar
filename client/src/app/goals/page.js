'use client';

import { useState } from 'react';
import { Spinner } from '@nextui-org/react';
import useStore from '../store';
import GoalsTable from '../components/GoalsTable';
import CreateButton from '../components/CreateButton';
import GoalSetupModal from '../components/Modals/GoalSetupModal/GoalSetupModal';
import styles from './page.module.css';

export default function Goals() {
  const { currentProject, user } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const loading = user === null;

  if (loading) {
    return <Spinner size="xl" color="primary" />;
  }

  const goals = currentProject?.goals || [];

  return (
    <div className={styles.Goals}>
      <div className={styles.tableHeader}>
        <div className={styles.colLeft}>
          <h2 className={styles.title}>Goals ({goals.length})</h2>
          <div className={styles.createNewGoal}>
            <CreateButton onClick={() => setShowCreateModal(true)} />
          </div>
        </div>
      </div>

      <GoalsTable goals={goals} />

      {showCreateModal && (
        <GoalSetupModal
          experiment={null}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
