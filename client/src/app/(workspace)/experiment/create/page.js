'use client';

import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { BreadcrumbItem, Breadcrumbs } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import ExperimentIcon from '../../../icons/Experiment';
import ShuffleIcon from '../../../icons/Shuffle';
import styles from './page.module.css';

export default function ExperimentTypePage() {
  const router = useRouter();

  return (
    <div className={styles.experimentTypeSelection}>
      <Breadcrumbs className={styles.breadCrumbs}>
        <BreadcrumbItem onClick={() => router.push('/dashboard')}>
          Experiments
        </BreadcrumbItem>
        <BreadcrumbItem>Create Experiment</BreadcrumbItem>
      </Breadcrumbs>
      <h1 className={styles.title}>Create New Experiment</h1>

      <div className={styles.cardContainer}>
        <Card
          isPressable
          className={styles.card}
          onClick={() => router.push('/experiment/create/ab/new')}
        >
          <ExperimentIcon height={25} width={25} />
          <CardHeader className={`${styles.cardHeader} ${styles.abCardHeader}`}>
            AB Experiment
          </CardHeader>
          <CardBody className={styles.cardBody}>
            Modify different elements of a same page with our visual editor
          </CardBody>
        </Card>

        <Card
          isPressable
          className={styles.card}
          onClick={() => router.push('/experiment/create/split-url/new')}
        >
          <ShuffleIcon height={25} width={25} />
          <CardHeader
            className={`${styles.cardHeader} ${styles.splitUrlCardHeader}`}
          >
            Split URL Experiment
          </CardHeader>
          <CardBody className={styles.cardBody}>
            Distribute your target page traffic to different URLs
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
