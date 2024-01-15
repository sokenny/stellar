import Experiment from '../../components/Experiment/Experiment';
import Continue from './Continue/Continue';
import SetUpGoal from '../SetUpGoal/SetUpGoal';
import styles from './page.module.css';

export default async function Journey({ params }) {
  const journeyId = params.id;
  const res = await fetch(`http://localhost:3001/api/journey/${journeyId}`, {
    cache: 'no-store',
  });
  const journey = await res.json();
  const experiments = journey.experiments;

  const sortedExperiments = journey.experiments_order
    .map((orderId) =>
      journey.experiments.find((experiment) => experiment.id === orderId),
    )
    .filter((experiment) => experiment != null);

  return (
    <div className={styles.Journey}>
      <h1 className={styles.title}>Journey {journey.id}:</h1>
      <h2 className={styles.subTitle}>
        A journey is a series of experiments that run sequentially in a given
        page.
      </h2>
      <div>
        {sortedExperiments.map((experiment, i) => {
          return (
            <Experiment
              onJourneyReview
              journeyId={journeyId}
              experiment={experiment}
              order={i + 1}
              key={experiment.id}
            />
          );
        })}
      </div>
    </div>
  );
}
