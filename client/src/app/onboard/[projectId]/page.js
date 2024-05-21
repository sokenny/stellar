// import { signIn } from 'next-auth/react';
import Actions from './Actions';
import Description from './Description';
import Experiment from '../../components/Experiment/Experiment';
import styles from './page.module.css';

export default async function OnboardPage({ params, searchParams }) {
  const projectId = params.projectId;
  const authenticated = searchParams.authenticated === 'true';
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
          {/* TODO-p1: Have puppeteer screenshot of element that has been targetted */}
          {experiments.map((experiment, i) => (
            <Experiment experiment={experiment} key={experiment.id} onReview />
          ))}
        </div>
      </div>
      <Actions projectId={projectId} authenticated={authenticated} />
    </div>
  );
}
