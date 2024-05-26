'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import useStore from '../../../store';
import {
  Switch,
  ListboxItem,
  Listbox,
  Tooltip,
  cn,
  useDisclosure,
} from '@nextui-org/react';
import ExperimentStatusesEnum from '../../../helpers/enums/ExperimentStatusesEnum';
import Button from '../../../components/Button';
import LaunchExperimentModal from '../../../components/Modals/LaunchExperimentModal';
import ThreeDotActions from './ThreeDotActions';
import StatusChip from '../../../components/StatusChip';
import styles from './Header.module.css';

const Header = ({ experiment }) => {
  const { refetchProjects, setErrorModal } = useStore();

  const [launchingExperiment, setLaunchingExperiment] = useState(false);
  const {
    isOpen: isLaunchModalOpen,
    onOpen: onOpenLaunchModal,
    onOpenChange: onOpenLaunchModalChange,
  } = useDisclosure();
  // const [showLaunchModal, setShowLaunchModal] = useState(true);

  function handleLaunchExperiment() {
    setLaunchingExperiment(true);
    try {
      toast.promise(
        // fetch(
        //   `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experiment.id}/launch`,
        //   {
        //     method: 'POST',
        //   },
        // ),
        async () => {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_STELLAR_API}/experiment/${experiment.id}/launch`,
            {
              method: 'POST',
            },
          );

          // Check if the response was not ok (e.g., status code 400 or 500)
          if (!response.ok) {
            const errorData = await response.json(); // Assuming the server sends JSON with an error message
            throw new Error(errorData.message || 'Something went wrong');
          }

          // If everything is okay, process and return the response
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
    return '';
  }

  const canLaunchExperiment = hasGoal && !hasCeroChanges;
  const showSwitch = experiment.started_at && !experiment.ended_at;

  return (
    <div className={styles.container}>
      <div className={styles.colLeft}>
        {/* TODO-p1: Poder editar el experiment name desde acá */}
        <h1 className={styles.title}>{experiment.name}</h1>
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
                isDisabled={!experiment.goal}
              />
            </span>
          </Tooltip>
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
        />
      </div>
    </div>
  );
};

export default Header;
