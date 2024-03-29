import Experiment from '../../components/Experiment/Experiment';
import Notifications from '../Notifications';
import styles from './page.module.css';

export default async function ExperimentPage({ params, searchParams }) {
  const experimentId = params.id;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experimentId}`,
    {
      cache: 'no-store',
    },
  );

  const experiment = await res.json();

  return (
    <div className={styles.Experiment}>
      <Notifications searchParams={searchParams} />
      <h1 className={styles.title}>{experiment.name}</h1>
      <Experiment experiment={experiment} open={true} />
      {/* TODO-p1: Groom multi element variant - editor mode where you can have css and js block */}
      {/* TODO-p1-3: Work on modal right before "launch journey" that sets up the user's account & paypal sub */}
    </div>
  );
}
