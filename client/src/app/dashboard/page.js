'use client';

import useStore from '../store';
import TabsAndExperiments from '../components/TabsAndExperiments/TabsAndExperiments';
import styles from './page.module.css';

// TODO-p2 have a main store for the app - investigate good options for next.js

export default function Dashboard() {
  const { currentProject } = useStore();

  const loading = !currentProject.id;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.Dashboard}>
      <TabsAndExperiments experiments={currentProject.experiments} />
    </div>
  );
}
