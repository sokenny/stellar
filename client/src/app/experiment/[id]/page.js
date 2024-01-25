import Experiment from '../../components/Experiment/Experiment';
import styles from './page.module.css';

export default async function ExperimentPage({ params }) {
  const experimentId = params.id;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experimentId}`,
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
      {/* TODO-p1-1: Work on modal right before "launch journey" that sets up the user's account & paypal sub */}
      {/* TODO-p1-2: Allow manual creation of experiments from 'editor mode' */}
    </div>
  );
}
