'use client';

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import useStore from '../../../../store';
import { Switch, Tooltip, useDisclosure } from '@nextui-org/react';
import ExperimentStatusesEnum from '../../../../helpers/enums/ExperimentStatusesEnum';
import Button from '../../../../components/Button';
import LaunchExperimentModal from '../../../../components/Modals/LaunchExperimentModal';
import ThreeDotActions from './ThreeDotActions';
import ExperimentName from './ExperimentName';
import StatusChip from '../../../../components/StatusChip';
import styles from './Header.module.css';
import getMainGoal from '../../../../helpers/getMainGoal';

const Header = ({ experiment }) => {
  const experimentGoal = getMainGoal(experiment);
  const { refetchProjects, currentProject, setErrorModal } = useStore();
  const [launchingExperiment, setLaunchingExperiment] = useState(false);
  const queuedAfter = currentProject?.experiments?.find(
    (e) => experiment.queue_after === e.id,
  );
  const {
    isOpen: isLaunchModalOpen,
    onOpen: onOpenLaunchModal,
    onOpenChange: onOpenLaunchModalChange,
  } = useDisclosure();

  function handleLaunchExperiment() {
    setLaunchingExperiment(true);
    try {
      toast.promise(
        async () => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experiment.id}/launch`,
            {
              method: 'POST',
            },
          );

          if (!response.ok) {
            const errorData = await response.json(); // Assuming the server sends JSON with an error message
            throw new Error(errorData.message || 'Something went wrong');
          }

          return response.json();
        },
        {
          loading: 'Launching experiment...',
          success: async () => {
            refetchProjects();
            setLaunchingExperiment(false);
            return 'Experiment launched successfully';
          },
          error: async (e) => {
            console.log('E! ', e);
            setLaunchingExperiment(false);
            setErrorModal(e?.message || 'Something went wrong');
            return 'Failed to launch experiment';
          },
        },
      );
    } catch (e) {
      console.error(e);
      setErrorModal(e.message || 'Something went wrong');
    }
  }

  function handleSwitchChange(isSelected) {
    if (!isSelected) {
      return toast.promise(
        fetch(
          `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experiment.id}/pause`,
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
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experiment.id}/on`,
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

  const hasGoal = !!experimentGoal;
  const hasCeroChanges = experiment.variants.every(
    (variant) =>
      variant.modifications?.length === 0 &&
      !variant.global_css &&
      !variant.global_js,
  );
  const hasMissingVariantURLs =
    experiment.type === 'SPLIT_URL' &&
    experiment.variants.some((variant) => !variant.url);

  function getLaunchTooltipCopy() {
    if (!hasGoal) {
      return 'Set up a goal before launching your experiment';
    }
    if (experiment.type === 'SPLIT_URL' && hasMissingVariantURLs) {
      return 'Add URLs to all variants before launching';
    }
    if (experiment.type !== 'SPLIT_URL' && hasCeroChanges) {
      return 'Add at least one change to your experiment before launching';
    }
    if (queuedAfter) {
      return `This experiment is set to launch after "${queuedAfter.name}" ends. Change this setting if you wish to launch now.`;
    }
    return '';
  }

  const canLaunchExperiment =
    hasGoal &&
    (experiment.type === 'SPLIT_URL'
      ? !hasMissingVariantURLs
      : !hasCeroChanges) &&
    !queuedAfter;
  const showSwitch = experiment.started_at && !experiment.ended_at;

  const getStatusClass = () => {
    if (experiment.status === ExperimentStatusesEnum.RUNNING) {
      return styles.running;
    }
    if (experiment.status === ExperimentStatusesEnum.PAUSED) {
      return styles.paused;
    }
    if (experiment.status === ExperimentStatusesEnum.ENDED) {
      return styles.ended;
    }
    if (experiment.status === ExperimentStatusesEnum.DRAFT) {
      return styles.draft;
    }
    return '';
  };

  return (
    <div className={`${styles.container} ${getStatusClass()}`}>
      <div className={styles.colLeft}>
        <ExperimentName
          name={experiment.name}
          experimentId={experiment.id}
          type={experiment.type}
        />
        <StatusChip status={experiment.status} size="md" />
      </div>
      <div className={styles.colRight}>
        {showSwitch && (
          <Tooltip
            showArrow
            content={
              experiment.status === ExperimentStatusesEnum.RUNNING
                ? 'Pause Experiment'
                : 'Resume Experiment'
            }
            className={styles.goalTooltip}
            closeDelay={0}
          >
            <span>
              <Switch
                defaultSelected={
                  experiment.status === ExperimentStatusesEnum.RUNNING
                }
                onValueChange={handleSwitchChange}
                isDisabled={!hasGoal}
              />
            </span>
          </Tooltip>
        )}
        {!experiment.started_at && (
          <Tooltip
            content={getLaunchTooltipCopy()}
            isDisabled={canLaunchExperiment}
            showArrow
            className={styles.tooltip}
            closeDelay={200}
          >
            <span>
              <Button
                disabled={!canLaunchExperiment}
                onClick={canLaunchExperiment ? onOpenLaunchModal : () => {}}
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
        <LaunchExperimentModal
          isOpen={isLaunchModalOpen}
          onOpenChange={onOpenLaunchModalChange}
          onLaunch={handleLaunchExperiment}
          experimentId={experiment.id}
        />
      </div>
    </div>
  );
};

export default Header;
