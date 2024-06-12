'use client';
import React, { useState } from 'react';
import {
  Tooltip,
  Spinner,
  useDisclosure,
  BreadcrumbItem,
  Breadcrumbs,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import useStore from '../../../store';
import styles from './page.module.css';

export default function SettingsPage({ params }) {
  const router = useRouter();
  const experimentId = params.id;
  const { currentProject, refetchProjects } = useStore();
  const loading = Object.keys(currentProject).length === 0;
  const experiment = currentProject?.experiments?.find(
    (e) => e.id == experimentId,
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Breadcrumbs className={styles.breadCrumbs}>
        <BreadcrumbItem onClick={() => router.push('/dashboard')}>
          Experiments
        </BreadcrumbItem>
        <BreadcrumbItem
          onClick={() => router.push(`/experiment/${experimentId}`)}
        >
          {experiment.name}
        </BreadcrumbItem>
        <BreadcrumbItem>settings</BreadcrumbItem>
      </Breadcrumbs>
      <pre>{JSON.stringify(experiment)}</pre>
      <h1>LCDTM!</h1>
    </>
  );
}
