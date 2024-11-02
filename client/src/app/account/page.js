'use client';

import useStore from '../store';
import styles from './page.module.css';
import DisplaySnippet from '../components/DisplaySnippet';

export default function Account({}) {
  const { user } = useStore();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Projects</h3>
      <div className={styles.projects}>
        {user?.projects?.map((project) => {
          const apiKey = user?.api_keys.find(
            (key) => key.project_id === project.id,
          )?.key;
          return (
            <div key={project.id} className={styles.project}>
              <h4>{project.name}</h4>
              <DisplaySnippet apiKey={apiKey} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
