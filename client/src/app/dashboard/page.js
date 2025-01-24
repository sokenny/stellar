'use client';

import { useEffect } from 'react';

import useStore from '../store';
import TabsAndExperiments from '../components/TabsAndExperiments/TabsAndExperiments';
import SnippetMissing from '../components/SnippetMissing';
import CreateSimpleProjectForm from '../components/CreateSimpleProjectForm';
import styles from './page.module.css';
import EmailVerificationRequired from '../components/EmailVerificationRequired';
import { Spinner } from '@nextui-org/react';

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
    return <Spinner size="xl" color="primary" />;
  }

  // needs email verification if user.password exists and !user.confirmed_at
  const needsEmailVerification = user.password && !user.confirmed_at;

  return (
    <div className={styles.Dashboard}>
      <div className={styles.tutorialLink}>
        <a
          href="https://youtu.be/dpDv5s4CZGA?si=Lt3N4TYgHeey4K4X"
          rel="noreferrer"
          target="_blank"
        >
          📽⚡️ Watch our quick tutorial
        </a>
      </div>

      <div className={styles.banners}>
        {needsEmailVerification && <EmailVerificationRequired />}
        {missingSnippet && (
          <SnippetMissing
            className={styles.snippet}
            cardTitle="Install our snippet to get started"
          />
        )}
      </div>
      {currentProject && (
        <TabsAndExperiments experiments={currentProject.experiments} />
      )}
      {emptyState && (
        <div className={styles.setUpProjectFlow}>
          <h3 className={styles.title}>Let's set up your first domain! 🚀</h3>
          <div className={styles.description}>
            Enter your website's url to get started.
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
