'use client';

import { useEffect } from 'react';

import useStore from '../store';
import TabsAndExperiments from '../components/TabsAndExperiments/TabsAndExperiments';
import SnippetMissing from '../components/SnippetMissing';
import CreateSimpleProjectForm from '../components/CreateSimpleProjectForm';
import styles from './page.module.css';

// TODO-p2: Probarlo para in-product ab tests como dijo Adrian

export default function Dashboard() {
  const { currentProject, user } = useStore();
  const loading = user === null;
  const missingSnippet = currentProject && currentProject?.snippet_status !== 1;

  const emptyState = !currentProject && !loading;

  useEffect(() => {
    window?.gtag?.('event', 'ads_conversion_Registro_1', {
      projectId: currentProject?.id,
    });

    const chatOpened = localStorage.getItem('chatOpened');
    if (!chatOpened && user?.onboardingAnswer) {
      window?.$crisp?.push(['do', 'chat:open']);
      localStorage.setItem('chatOpened', 'true');
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.Dashboard}>
      <div className={styles.tutorialLink}>
        <a
          href="https://www.loom.com/embed/c30706b01dfb436c8efcddb5e3a93600?sid=4de78133-64c7-41e6-81ae-20d0aed2ddb4"
          rel="noreferrer"
          target="_blank"
        >
          📽⚡️ Watch our quick tutorial
        </a>
      </div>
      {missingSnippet && <SnippetMissing className={styles.snippet} />}
      {currentProject && (
        <TabsAndExperiments experiments={currentProject.experiments} />
      )}
      {emptyState && (
        <div className={styles.setUpProjectFlow}>
          <h3 className={styles.title}>Let's set up your first project! 🚀</h3>
          <div className={styles.description}>
            Enter your website's domain to get started.
          </div>
          <CreateSimpleProjectForm
            className={styles.urlForm}
            onSuccess={async (project) => {
              return fetch(
                `${process.env.NEXT_PUBLIC_STELLAR_API}/api/onboard/${project.id}`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userEmail: user.email,
                  }),
                },
              ).then(() => {
                window.location.href = '/dashboard';
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
