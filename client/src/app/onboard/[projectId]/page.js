import Actions from './Actions';
import Description from './Description';
import Experiment from '../../components/Experiment/Experiment';
import styles from './page.module.css';
import getRandomConversionRate from '../../helpers/getRandomConversionRate';

export default async function OnboardPage({ params, searchParams }) {
  const projectId = params.projectId;
  const authenticated = searchParams.authenticated === 'true';
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STELLAR_API}/public/onboard/${projectId}/experiments`,
    {
      cache: 'no-store',
    },
  );

  const experiments = await res.json();

  const totalEstimatedCR = experiments.reduce((acc, experiment) => {
    return (
      acc +
      getRandomConversionRate({
        seed: experiment.id,
        experimentType: experiment.type,
      })
    );
  }, 0);

  return (
    <div className={styles.Experiment}>
      <h1 className={styles.title}>Review & Submit</h1>
      <Description estimatedCR={totalEstimatedCR} />
      <div className={styles.content}>
        <div className={styles.experiments}>
          {experiments.map((experiment, i) => (
            <Experiment experiment={experiment} key={experiment.id} onReview />
          ))}
        </div>
      </div>
      <Actions projectId={projectId} authenticated={authenticated} />
    </div>
  );
}
