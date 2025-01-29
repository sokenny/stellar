'use client';

import ExperimentName from '../../../[id]/Header/ExperimentName';
import CreateExperimentForm from '../../../../../components/CreateExperimentForm';
import { Spinner, BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import useStore from '../../../../../store';

import styles from './page.module.css';

export default function CreateExperimentPage({ params }) {
  const router = useRouter();
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
      <Breadcrumbs className={styles.breadCrumbs}>
        <BreadcrumbItem onClick={() => router.push('/dashboard')}>
          Experiments
        </BreadcrumbItem>
        <BreadcrumbItem onClick={() => router.push('/experiment/create')}>
          Create Experiment
        </BreadcrumbItem>
        <BreadcrumbItem>A/B</BreadcrumbItem>
      </Breadcrumbs>
      {isNew ? (
        <h1 className={styles.title}>Create an A/B Experiment</h1>
      ) : (
        <ExperimentName
          name={experiment?.name}
          experimentId={id}
          className={styles.title}
          type="AB"
        />
      )}

      <CreateExperimentForm experimentId={id} />
    </div>
  );
}
