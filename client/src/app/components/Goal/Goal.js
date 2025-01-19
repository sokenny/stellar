'use client';

import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import { Tooltip } from '@nextui-org/react';
import Edit from '../../icons/Edit';
import styles from './Goal.module.css';
import useStore from '../../store';

const Goal = ({ experiment, onEdit, className }) => {
  const { token } = useStore();
  if (!experiment) return;

  const { goal, url, status } = experiment;
  const canEditGoal = status === ExperimentStatusesEnum.PENDING;
  const goalDescriptionMapper = {
    PAGE_VISIT: (
      <>
        User visits to{' '}
        {goal.url_match_type === 'CONTAINS' ? (
          <>
            a page containing "<strong>{goal.url_match_value}</strong>"
          </>
        ) : (
          <a
            href={`${goal.url_match_value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {goal.url_match_value}
          </a>
        )}
      </>
    ),
    CLICK: (
      <>
        User clicks on a{' '}
        {goal.url_match_value === '*' ? (
          <>
            specific element: <span>{goal.selector}</span>
          </>
        ) : (
          <a
            href={`${
              typeof goal.url_match_value === 'string'
                ? goal.url_match_value
                : ''
            }?stellarMode=true&elementToHighlight=${
              goal.selector
            }&token=${token}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            specific element
          </a>
        )}
        .
      </>
    ),
    SESSION_TIME: (
      <>
        <span>Time spent</span> by user on the page
      </>
    ),
  };

  return (
    <div className={`${styles.Goal} ${className ? className : ''}`}>
      <div className={styles.title}>Goal:</div>
      <div className={styles.goalDescription}>
        {goalDescriptionMapper[goal.type]}
      </div>
      {canEditGoal && (
        <Tooltip
          showArrow
          content="Edit goal"
          className={styles.editTooltip}
          closeDelay={0}
        >
          <div className={styles.edit} onClick={onEdit}>
            <Edit width={15} height={15} />
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export default Goal;
