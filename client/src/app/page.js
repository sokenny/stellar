import Experiment from './components/Experiment/Experiment';
import styles from './page.module.css';

export default async function Dashboard({ params }) {
  const res = await fetch(`http://localhost:3001/api/experiments`, {
    cache: 'no-store',
  });
  const experiments = await res.json();

  const runningExperiments = experiments.filter(
    (experiment) =>
      experiment.started_at !== null && experiment.ended_at === null,
  );
  const queuedExperiments = experiments.filter(
    (experiment) => experiment.started_at === null,
  );
  const completedExperiments = experiments.filter(
    (experiment) => experiment.ended_at !== null,
  );

  return (
    <div className={styles.Dashboard}>
      <div className={styles.runningExperiments}>
        <h2 className={styles.title}>Running Experiments</h2>
        <div className={styles.experiments}>
          {runningExperiments.map((experiment) => (
            <Experiment key={experiment.id} experiment={experiment} />
          ))}
        </div>
      </div>
      <div className={styles.queuedExperiments}>
        <h2 className={styles.title}>Queued Experiments</h2>
        <div className={styles.experiments}>
          {queuedExperiments.map((experiment) => (
            <Experiment
              key={experiment.id}
              experiment={experiment}
              open={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
