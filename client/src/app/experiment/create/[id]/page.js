'use client';
import { useEffect, useState } from 'react';
import CreateExperimentForm from '../../../components/CreateExperimentForm';
import useStore from '../../../store';

import styles from './page.module.css';

export default function CreateExperimentPage({ params }) {
  const { currentProject } = useStore();
  const loading = Object.keys(currentProject).length === 0;
  const { id } = params;
  const isNew = id === 'new';

  const experiment = isNew
    ? null
    : currentProject?.experiments?.find((e) => e.id == id);

  if (loading) {
    return <div>Loading...</div>;
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
