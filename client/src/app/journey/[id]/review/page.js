import Experiment from '../../../components/Experiment/Experiment';
import LaunchButton from './LaunchButton/LaunchButton';
import styles from './page.module.css';

export default async function ReviewJourney({ params }) {
  const joruneyId = params.id;
  const res = await fetch(`http://localhost:3001/api/journey/${joruneyId}`, {
    // cache: 'force-cache',
    cache: 'no-store',
  });
  const journey = await res.json();

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
        {journey.experiments.map((experiment, i) => (
          <Experiment
            key={experiment.id}
            name={experiment.name}
            startDate={experiment.start_date}
            endDate={experiment.end_date}
            variants={experiment.variants}
            goal={experiment.goal}
            open={i === 0}
            url={experiment.url}
          />
        ))}
      </div>
      <LaunchButton journeyId={journey.id} />
    </div>
  );
}
