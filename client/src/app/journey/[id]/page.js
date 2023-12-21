import Experiment from '@/app/components/Experiment/Experiment';
import SetUpGoal from '../SetUpGoal/SetUpGoal';
import styles from './page.module.css';

// TODO: Design journey concept page on figma
export default async function Journey({ params }) {
  const joruneyId = params.id;
  const res = await fetch(`http://localhost:3001/api/journey/${joruneyId}`, {
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
      <div className={styles.firstExperiment}>
        <Experiment
          key={firstExperiment.id}
          name={firstExperiment.name}
          startDate={firstExperiment.start_date}
          endDate={firstExperiment.end_date}
          variants={firstExperiment.variants}
          goal={firstExperiment.goal}
          url={firstExperiment.url}
        />
        <SetUpGoal experimentId={firstExperiment.id} />
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
                name={experiment.name}
                startDate={experiment.start_date}
                endDate={experiment.end_date}
                variants={experiment.variants}
                goal={experiment.goal}
                url={experiment.url}
                open={false}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
