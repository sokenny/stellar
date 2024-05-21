'use client';

import useStore from '../store';
import TabsAndExperiments from '../components/TabsAndExperiments/TabsAndExperiments';
import SnippetMissing from '../components/SnippetMissing';
import styles from './page.module.css';

export default function Dashboard() {
  const { currentProject } = useStore();

  const loading = !currentProject.id;
  const missingSnippet = currentProject.snippet_status !== 1;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.Dashboard}>
      {missingSnippet && <SnippetMissing className={styles.snippet} />}
      <TabsAndExperiments experiments={currentProject.experiments} />
    </div>
  );
}
