'use client';

import React from 'react';
import { toast } from 'sonner';
import useStore from '../../../store';
import { Switch, Chip } from '@nextui-org/react';
import ExperimentStatusesEnum from '../../../helpers/enums/ExperimentStatusesEnum';
import styles from './Header.module.css';

const Header = ({ experiment }) => {
  const { refetchProjects } = useStore();
  function getExperimentStatusChip(status) {
    if (status === ExperimentStatusesEnum.RUNNING) {
      return (
        <Chip className={styles.chip} color="success">
          Running
        </Chip>
      );
    }
    if (status === ExperimentStatusesEnum.PAUSED) {
      return (
        <Chip className={styles.chip} color="warning">
          Paused
        </Chip>
      );
    }
    if (status === ExperimentStatusesEnum.PENDING) {
      return (
        <Chip className={styles.chip} color="warning">
          Pending
        </Chip>
      );
    }
    return <></>;
  }

  function handleSwitchChange(isSelected) {
    console.log('switch changed');

    if (!isSelected) {
      return toast.promise(
        fetch(
          `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experiment.id}/pause`,
          {
            method: 'POST',
          },
        ),
        {
          loading: 'Pausing experiment...',
          success: async () => {
            refetchProjects();
            return 'Experiment paused';
          },
          error: 'Failed to pause experiment',
        },
      );
    }
    return toast.promise(
      fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experiment.id}/on`,
        {
          method: 'POST',
        },
      ),
      {
        loading: 'Resuming experiment...',
        success: async () => {
          refetchProjects();
          return 'Experiment resumed';
        },
        error: 'Failed to resume experiment',
      },
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{experiment.name}</h1>
      <div className={styles.colRight}>
        {getExperimentStatusChip(experiment.status)}
        <Switch
          defaultSelected={experiment.status === ExperimentStatusesEnum.RUNNING}
          onValueChange={handleSwitchChange}
        />
      </div>
    </div>
  );
};

export default Header;
