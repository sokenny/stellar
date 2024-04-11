'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import useStore from '../../../store';
import { Switch, ListboxItem, Listbox, Tooltip, cn } from '@nextui-org/react';
import ExperimentStatusesEnum from '../../../helpers/enums/ExperimentStatusesEnum';
import Button from '../../../components/Button';
import ThreeDotActions from './ThreeDotActions';
import StatusChip from '../../../components/StatusChip';
import styles from './Header.module.css';

const Header = ({ experiment }) => {
  const { refetchProjects } = useStore();
  const [launchingExperiment, setLaunchingExperiment] = useState(false);

  function handleLaunchExperiment() {
    setLaunchingExperiment(true);
    try {
      toast.promise(
        fetch(
          `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experiment.id}/launch`,
          {
            method: 'POST',
          },
        ),
        {
          loading: 'Launching experiment...',
          success: async () => {
            refetchProjects();
            setLaunchingExperiment(false);
            return 'Experiment launched successfully';
          },
          error: async () => {
            setLaunchingExperiment(false);
            return 'Failed to launch experiment';
          },
        },
      );
    } catch (e) {
      console.error(e);
    }
  }

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

  const hasGoal = experiment.goal;
  const hasCeroChanges = !experiment.variants.some(
    (variant) => variant.modifications?.length > 0,
  );

  function getSwitchTooltipCopy() {
    if (!experiment.goal) {
      return 'Set up a goal before launching your experiment';
    }
    if (hasCeroChanges) {
      return 'Add at least one change to your experiment before launching';
    }
    return 'Caca';
  }

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
              <Button
                disabled={!canLaunchExperiment}
                onClick={handleLaunchExperiment}
                loading={launchingExperiment}
                className={styles.launchButton}
              >
                Launch Experiment
              </Button>
            </span>
          </Tooltip>
        )}

        <ThreeDotActions
          experimentId={experiment.id}
          status={experiment.status}
        />
      </div>
    </div>
  );
};

export default Header;
