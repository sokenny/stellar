import Experiment from '@/app/components/Experiment/Experiment';
import styles from './page.module.css';

// TODO: Design journey concept page on figma
export default async function Journey({ params }) {
  const joruneyId = params.id;
  const res = await fetch(`http://localhost:3001/api/journey/${joruneyId}`, {
    cache: 'force-cache',
  });
  const journey = await res.json();
  console.log('journey!', journey);

  return (
    <div className={styles.Journey}>
      <h1 className={styles.title}>Journey</h1>
      <div className={styles.map}>
        {journey.experiments.map((experiment, i) => (
          <Experiment
            key={experiment.id}
            name={experiment.name}
            startDate={experiment.start_date}
            endDate={experiment.end_date}
            variants={experiment.variants}
          />
        ))}
      </div>
    </div>
  );
}
