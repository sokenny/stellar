'use client';

import CreateExperimentForm from '../../components/CreateExperimentForm';

import styles from './page.module.css';

export default async function CreateExperimentPage({}) {
  return (
    <div className={styles.CreateExperiment}>
      <h1 className={styles.title}>Create Experiment</h1>
      <CreateExperimentForm />
    </div>
  );
}
