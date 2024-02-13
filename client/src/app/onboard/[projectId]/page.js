import { signIn } from 'next-auth/react';
import Actions from './Actions';
import Description from './Description';
import Experiment from '../../components/Experiment';
import styles from './page.module.css';

export default async function OnboardPage({ params, searchParams }) {
  const projectId = params.projectId;
  // get authenticated from query params
  const authenticated = searchParams.authenticated === 'true';
  console.log('authenticated', authenticated);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STELLAR_API}/projects/${projectId}/experiments`,
    {
      cache: 'no-store',
    },
  );

  const experiments = await res.json();

  return (
    <div className={styles.Experiment}>
      <h1 className={styles.title}>Review & Submit</h1>
      <Description />
      <div className={styles.content}>
        <div className={styles.experiments}>
          {experiments.map((experiment, i) => (
            <Experiment
              experiment={experiment}
              key={experiment.id}
              onReview
              open={i === 0}
            />
          ))}
        </div>
      </div>
      <Actions projectId={projectId} authenticated={authenticated} />
    </div>
  );
}
