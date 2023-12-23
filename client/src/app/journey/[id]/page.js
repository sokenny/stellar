import Experiment from '../../components/Experiment/Experiment';
import Continue from './Continue/Continue';
import SetUpGoal from '../SetUpGoal/SetUpGoal';
import styles from './page.module.css';

export default async function Journey({ params }) {
  const journeyId = params.id;
  const res = await fetch(`http://localhost:3001/api/journey/${journeyId}`, {
    // cache: 'force-cache',
    cache: 'no-store',
  });

  const journey = await res.json();

  const firstExperiment = journey.experiments[0];
  const queuedExperiments = journey.experiments.slice(1);

  return (
    <div className={styles.Journey}>
      <h1 className={styles.title}>
        This is the first experiment we will run:
      </h1>
      <h2 className={styles.subTitle}>
        Continue by setting up a goal, or choose a different experiment to start
        your journey with.
      </h2>
      <div className={styles.firstExperiment}>
        <Experiment key={firstExperiment.id} experiment={firstExperiment} />
        {!firstExperiment.goal && (
          <SetUpGoal experimentId={firstExperiment.id} />
        )}
      </div>
      {queuedExperiments.length > 0 && (
        <>
          <h2 className={styles.title}>
            We've got {queuedExperiments.length} more queued up after that:
          </h2>
          <div className={styles.experiments}>
            {queuedExperiments.map((experiment, i) => (
              <Experiment
                key={experiment.id}
                experiment={experiment}
                open={false}
              />
            ))}
          </div>
        </>
      )}
      {firstExperiment.goal && (
        <Continue journeyId={journeyId}>Continue</Continue>
      )}
    </div>
  );
}
