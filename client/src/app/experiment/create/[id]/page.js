'use client';
import { useEffect, useState } from 'react';
import CreateExperimentForm from '../../../components/CreateExperimentForm';
import useStore from '../../../store';

import styles from './page.module.css';

export default function CreateExperimentPage({ params }) {
  const { currentProject, user } = useStore();
  const loading = user === null || !currentProject;
  const { id } = params;
  const isNew = id === 'new';

  if (loading) {
    return <div>Loading...</div>;
  }

  const experiment = isNew
    ? null
    : currentProject?.experiments?.find((e) => e.id == id);

  if (!experiment) {
    return <div>Experiment not found</div>;
  }

  return (
    <div className={styles.CreateExperiment}>
      <h1 className={styles.title}>
        {isNew ? 'Create Experiment' : experiment.name}
      </h1>
      <CreateExperimentForm experiment={experiment} />
    </div>
  );
}
