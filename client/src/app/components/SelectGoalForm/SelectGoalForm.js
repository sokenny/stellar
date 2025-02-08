'use client';

import { useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Tooltip,
  ScrollShadow,
  Button as NextUIButton,
} from '@nextui-org/react';
import styles from './SelectGoalForm.module.css';
import GoalTypesEnum from '../../helpers/enums/GoalTypesEnum';
import Click from '../../icons/Click';
import Page from '../../icons/Page';
import Time from '../../icons/Time';
import Edit from '../../icons/Edit';
import Info from '../../icons/Info/Info';
import UrlMatchTypesEnum from '../../helpers/enums/UrlMatchTypesEnum';
import Button from '../Button';
import { toast } from 'sonner';
import useStore from '../../store';

const goalTypeIcons = {
  [GoalTypesEnum.CLICK]: <Click width={22} height={22} />,
  [GoalTypesEnum.PAGE_VISIT]: <Page width={22} height={22} />,
  [GoalTypesEnum.SESSION_TIME]: <Time width={22} height={22} />,
};

const goalTypeLabels = {
  [GoalTypesEnum.CLICK]: 'Clicks',
  [GoalTypesEnum.PAGE_VISIT]: 'Page Visits',
  [GoalTypesEnum.SESSION_TIME]: 'Time on Page',
};

const SelectGoalForm = ({
  currentProject,
  goals = [],
  onOpenChange,
  experimentId,
  onCreateNewGoal,
  onEditGoal,
}) => {
  const { refetchExperiment } = useStore();
  console.log('goals aca', goals);
  const defaultSelectedGoal =
    goals.find((goal) => goal.GoalExperiment.is_main) || null;
  const defaultSecondaryGoals = goals.filter(
    (goal) => !goal.GoalExperiment.is_main,
  );
  const [selectedMainGoal, setSelectedMainGoal] = useState(defaultSelectedGoal);
  const [selectedSecondaryGoals, setSelectedSecondaryGoals] = useState(
    defaultSecondaryGoals,
  );
  const [isSaving, setIsSaving] = useState(false);

  const secondaryGoals = selectedMainGoal
    ? currentProject?.goals
        ?.filter((goal) => goal.id !== selectedMainGoal.id)
        .sort((a, b) => b.id - a.id)
    : [];

  const handleGoalSelection = async () => {
    try {
      setIsSaving(true);
      const goalsPayload = [
        { id: selectedMainGoal.id, isMain: true },
        ...selectedSecondaryGoals.map((goal) => ({
          id: goal.id,
          isMain: false,
        })),
      ];

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experimentId}/goals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ goals: goalsPayload }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to save goals');
      }

      toast.success('Goals saved successfully');
      onOpenChange(false);
      await refetchExperiment(experimentId);
    } catch (error) {
      console.error('Error saving goals:', error);
      toast.error('Failed to save goals. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSecondaryGoal = (goal) => {
    setSelectedSecondaryGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g.id !== goal.id)
        : [...prev, goal],
    );
  };

  const renderGoalItem = (goal, isMainSelection = true) => (
    <div
      key={goal.id}
      className={`${styles.goalItem} ${
        (
          isMainSelection
            ? selectedMainGoal?.id === goal.id
            : selectedSecondaryGoals.some((g) => g.id === goal.id)
        )
          ? styles.selected
          : ''
      }`}
      onClick={() => {
        if (isMainSelection) {
          const newMainGoal = selectedMainGoal?.id === goal.id ? null : goal;
          setSelectedMainGoal(newMainGoal);
          // Clear secondary goals if main goal is unselected
          if (!newMainGoal) {
            setSelectedSecondaryGoals([]);
          }
        } else {
          toggleSecondaryGoal(goal);
        }
      }}
    >
      <div className={styles.goalHeader}>
        <div className={styles.goalIcon}>{goalTypeIcons[goal.type]}</div>
        <div className={styles.goalInfo}>
          <div className={styles.goalName}>{goal.name || 'Untitled Goal'}</div>
          <div className={styles.goalAttributes}>
            <div className={styles.goalType}>{goalTypeLabels[goal.type]}</div>
            {goal.type === 'CLICK' && (
              <div className={styles.goalSelector}>
                <code>{goal.selector}</code>
              </div>
            )}
            {goal.type === 'PAGE_VISIT' && (
              <div className={styles.goalUrlMatch}>{goal.url_match_value}</div>
            )}
          </div>
        </div>
        <Tooltip content="Edit Goal" showArrow>
          <button
            className={styles.editButton}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit goal:', goal);
              onEditGoal(goal);
            }}
          >
            <Edit width={16} height={16} />
          </button>
        </Tooltip>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={true}
      onOpenChange={onOpenChange}
      size="2xl"
      isDismissable
      className={styles.modal}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className={styles.modalHeader}>
              Goal Set Up
            </ModalHeader>
            <ModalBody className={styles.modalBody}>
              <div
                className={`${styles.section} ${
                  selectedMainGoal ? styles.mainGoalSelected : ''
                }`}
              >
                <h3 className={styles.sectionTitle}>Select your main goal</h3>
                <div className={styles.goals}>
                  {selectedMainGoal
                    ? renderGoalItem(selectedMainGoal, true)
                    : currentProject?.goals
                        ?.sort((a, b) => b.id - a.id)
                        .map((goal) => renderGoalItem(goal, true))}
                </div>
              </div>

              {selectedMainGoal && secondaryGoals.length > 0 && (
                <div className={`${styles.section} ${styles.secondaryGoal}`}>
                  <h3 className={styles.sectionTitle}>
                    Select secondary goals (optional)
                    <Tooltip
                      content="You can optionally subscribe to secondary goals for further insights. The experiment outcome will still be judged based on the main goal."
                      showArrow
                      closeDelay={200}
                      className={styles.secondaryGoalTooltip}
                    >
                      <span className={styles.infoIcon}>
                        <Info width={16} height={16} />
                      </span>
                    </Tooltip>
                  </h3>
                  <div className={styles.goals}>
                    {secondaryGoals.map((goal) => renderGoalItem(goal, false))}
                  </div>
                </div>
              )}

              <div className={styles.section}>
                <div className={styles.createGoalSection}>
                  <NextUIButton
                    variant="light"
                    color="primary"
                    className={styles.createGoalButton}
                    onClick={onCreateNewGoal}
                  >
                    or create a new goal
                  </NextUIButton>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className={styles.modalFooter}>
              <NextUIButton
                variant="light"
                onPress={onClose}
                className={styles.button}
              >
                Cancel
              </NextUIButton>
              <Button
                color="primary"
                className={styles.button}
                disabled={!selectedMainGoal || isSaving}
                onClick={handleGoalSelection}
                loading={isSaving}
              >
                {secondaryGoals.length > 1 ? 'Set Goals' : 'Set Goal'}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default SelectGoalForm;
