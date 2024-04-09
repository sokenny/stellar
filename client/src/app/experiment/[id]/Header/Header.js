'use client';

import React from 'react';
import { toast } from 'sonner';
import useStore from '../../../store';
import { Switch, Chip, Tooltip } from '@nextui-org/react';
import ExperimentStatusesEnum from '../../../helpers/enums/ExperimentStatusesEnum';
import Button from '../../../components/Button';
import StatusChip from '../../../components/StatusChip';
import colors from '../../../helpers/colors';
import styles from './Header.module.css';

const Header = ({ experiment }) => {
  const { refetchProjects } = useStore();

  function handleSwitchChange(isSelected) {
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

  function getSwitchTooltipCopy() {
    if (!experiment.goal) {
      return 'Set up a goal before launching your experiment';
    }
    return 'Caca';
  }

  const hasGoal = experiment.goal;
  const hasCeroChanges = experiment.variants.every(
    (variant) => variant.modifications?.length === 0,
  );
  const canLaunchExperiment = hasGoal && !hasCeroChanges;
  const showSwitch = experiment.started_at && !experiment.ended_at;

  return (
    <div className={styles.container}>
      <div className={styles.colLeft}>
        <h1 className={styles.title}>{experiment.name}</h1>
        <StatusChip status={experiment.status} size="md" />
      </div>
      <div className={styles.colRight}>
        {showSwitch && (
          <Switch
            defaultSelected={
              experiment.status === ExperimentStatusesEnum.RUNNING
            }
            onValueChange={handleSwitchChange}
            isDisabled={!experiment.goal}
          />
        )}
        {!experiment.started_at && (
          <Tooltip
            content={getSwitchTooltipCopy()}
            isDisabled={canLaunchExperiment}
            showArrow
            className={styles.tooltip}
            closeDelay={200}
          >
            <span>
              <Button disabled={!canLaunchExperiment}>Launch Experiment</Button>
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default Header;
