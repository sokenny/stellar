'use client';
import ExperimentName from '../../[id]/Header/ExperimentName';
import CreateExperimentForm from '../../../components/CreateExperimentForm';
import { Spinner } from '@nextui-org/react';
import useStore from '../../../store';

import styles from './page.module.css';

export default function CreateExperimentPage({ params }) {
  const { currentProject, user } = useStore();
  const loading = user === null || !currentProject;
  const { id } = params;
  const isNew = id === 'new';

  if (loading) {
    return <Spinner size="xl" color="primary" />;
  }

  const experiment = isNew
    ? null
    : currentProject?.experiments?.find((e) => e.id == id);

  return (
    <div className={styles.CreateExperiment}>
      {isNew ? (
        <h1 className={styles.title}>Create Experiment</h1>
      ) : (
        <ExperimentName
          name={experiment?.name}
          experimentId={id}
          className={styles.title}
        />
      )}

      <CreateExperimentForm experimentId={id} />
    </div>
  );
}
