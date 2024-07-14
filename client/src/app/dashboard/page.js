'use client';

import useStore from '../store';
import TabsAndExperiments from '../components/TabsAndExperiments/TabsAndExperiments';
import SnippetMissing from '../components/SnippetMissing';
import styles from './page.module.css';
import EnterUrlForm from '../components/EnterUrlForm/EnterUrlForm';
import Script from 'next/script';

// TODO-p2: Probarlo para in-product ab tests como dijo Adrian

export default function Dashboard() {
  const { currentProject, user } = useStore();
  const loading = user === null;
  const missingSnippet = currentProject && currentProject?.snippet_status !== 1;

  const emptyState = !currentProject && !loading;

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.Dashboard}>
      <Script>
        {`
          gtag('event', 'ads_conversion_Started_onboarding_1', {
            project_id: ${currentProject?.id},
          });
        `}
      </Script>
      {missingSnippet && <SnippetMissing className={styles.snippet} />}
      {currentProject && (
        <TabsAndExperiments experiments={currentProject.experiments} />
      )}
      {emptyState && (
        <div className={styles.setUpProjectFlow}>
          <h3 className={styles.title}>Let's set up your first project! 🚀</h3>
          <div className={styles.description}>
            Enter your landing page or website URL to get started.
          </div>
          <EnterUrlForm
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
