import Experiment from '../../components/Experiment/Experiment';
import styles from './page.module.css';

export default async function ExperimentPage({ params }) {
  const experimentId = params.id;
  const res = await fetch(
    `http://localhost:3001/api/experiment/${experimentId}`,
    {
      // cache: 'force-cache',
      cache: 'no-store',
    },
  );

  const experiment = await res.json();

  return (
    <div className={styles.Experiment}>
      <h1 className={styles.title}>{experiment.name}</h1>
      <Experiment experiment={experiment} open={true} />
      {/* TODO-p1-1: Create section about statistical significance for running experiments */}
      {/* TODO-p1-2: Create section about "this exp is part of 'this journey', and create journey view page" */}
    </div>
  );
}
