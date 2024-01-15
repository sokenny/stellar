import Experiment from '../../../components/Experiment/Experiment';
import LaunchButton from './LaunchButton/LaunchButton';
import styles from './page.module.css';

export default async function ReviewJourney({ params }) {
  const joruneyId = params.id;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STELLAR_API}/journey/${joruneyId}`,
    {
      cache: 'no-store',
    },
  );
  const journey = await res.json();

  const goalSetForFirstExperiment = journey.experiments.find(
    (experiment) => experiment.id === journey.experiments_order[0],
  ).goal;

  const sortedExperiments = journey.experiments_order
    .map((orderId) =>
      journey.experiments.find((experiment) => experiment.id === orderId),
    )
    .filter((experiment) => experiment != null);

  return (
    <div className={styles.ReviewJourney}>
      <div className={styles.header}>
        <h1 className={styles.title}>Review & Launch</h1>
        <h2 className={styles.subTitle}>
          We will launch your first experiment after this step. Queued
          experiments will remain editable until they start running.
        </h2>
      </div>

      <div className={styles.experiments}>
        {sortedExperiments.map((experiment, i) => {
          const order = i + 1;
          return (
            <Experiment
              key={experiment.id}
              experiment={experiment}
              isFirst={order === 1}
              open={order === 1}
              journeyId={joruneyId}
              order={order}
              onJourneyReview
            />
          );
        })}
      </div>
      <LaunchButton
        journeyId={journey.id}
        disabled={!goalSetForFirstExperiment}
      />
    </div>
  );
}
