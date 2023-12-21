import getDomainFromUrl from '@/app/helpers/getDomainFromUrl';
import GoalsForm from '@/app/components/GoalsForm/GoalsForm';
import styles from './page.module.css';

// TODO: Design journey concept page on figma
export default async function SetGoal({ params }) {
  const experimentId = params['experiment-id'];

  const res = await fetch(
    `http://localhost:3001/api/experiment/${experimentId}`,
    {
      cache: 'force-cache',
    },
  );
  const experiment = await res.json();

  console.log(experiment);

  return (
    <div className={styles.SetGoal}>
      <div className={styles.header}>
        <h1 className={styles.title}>Set Goal</h1>
        <h2 className={styles.subTitle}>
          What valuable action should we track to measure success in your first
          experiment?
        </h2>
      </div>
      <GoalsForm domain={getDomainFromUrl(experiment?.url)} />
    </div>
  );
}
