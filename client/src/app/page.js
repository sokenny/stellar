import TabsAndExperiments from './components/TabsAndExperiments/TabsAndExperiments';
import styles from './page.module.css';

// TODO-p2 have a main store for the app - investigate good options for next.js

export default async function Dashboard() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STELLAR_API}/experiments`,
    {
      cache: 'no-store',
    },
  );
  const experiments = await res.json();

  return (
    <div className={styles.Dashboard}>
      <TabsAndExperiments experiments={experiments} />
    </div>
  );
}
