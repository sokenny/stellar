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
import SettingsForm from './SettingsForm';
import styles from './page.module.css';

export default function SettingsPage({ params }) {
  const router = useRouter();
  const experimentId = params.id;
  const { currentProject, user } = useStore();
  const loading = user === null || !currentProject;
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
        <BreadcrumbItem>Settings</BreadcrumbItem>
      </Breadcrumbs>
      <h1 className={styles.title}>Settings</h1>
      <SettingsForm experiment={experiment} />
    </>
  );
}
