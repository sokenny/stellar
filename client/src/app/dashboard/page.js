'use client';

import useStore from '../store';
import TabsAndExperiments from '../components/TabsAndExperiments/TabsAndExperiments';
import styles from './page.module.css';

export default function Dashboard() {
  const { currentProject } = useStore();

  const loading = !currentProject.id;

  console.log('currentProject', currentProject);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.Dashboard}>
      {/* TODO-p1: Redo this component using a table for experiments and Tabs component from NextUI */}
      <TabsAndExperiments experiments={currentProject.experiments} />
    </div>
  );
}
