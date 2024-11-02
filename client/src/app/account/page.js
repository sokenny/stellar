'use client';

import getStellarClientCode from '../helpers/getStellarClientCode';
import useStore from '../store';
import { Button } from '@nextui-org/react';
import styles from './page.module.css';

export default function Account({}) {
  const { user } = useStore();

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleCopy = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log('Snippet copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

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
              <div className={styles.snippet}>
                <div className={styles.label}>Snippet:</div>
                <pre>{getStellarClientCode(apiKey)}</pre>
                <Button
                  auto
                  flat
                  onClick={() => handleCopy(getStellarClientCode(apiKey))}
                  className={styles.copyBtn}
                  size="sm"
                  color="primary"
                  variant="flat"
                >
                  Copy Snippet
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
