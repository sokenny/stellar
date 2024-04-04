'use client';

import VariantsTable from '../../components/VariantsTable/VariantsTable';
import useStore from '../../store';
import Notifications from '../Notifications';
import Header from './Header';
import styles from './page.module.css';

export default function ExperimentPage({ params, searchParams }) {
  const experimentId = params.id;
  const { currentProject } = useStore();
  const loading = Object.keys(currentProject).length === 0;
  const experiment = currentProject?.experiments?.find(
    (e) => e.id == experimentId,
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.Experiment}>
      <Notifications searchParams={searchParams} />
      <Header experiment={experiment} className={styles.header} />
      {/* TODO-p1: Add action card here when the goal needs to be set up */}
      <section>
        {/* <h3 className={styles.sectionTitle}>Variants</h3> */}
        <VariantsTable variants={experiment.variants} experiment={experiment} />
      </section>
      {/* <Experiment experiment={experiment} open={true} /> */}
      {/* TODO-p2: Work on modal right before "launch journey" that sets up the user's account & paypal sub */}
    </div>
  );
}
