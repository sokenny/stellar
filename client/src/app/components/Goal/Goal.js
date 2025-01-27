'use client';

import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import { Tooltip } from '@nextui-org/react';
import Edit from '../../icons/Edit';
import styles from './Goal.module.css';
import useStore from '../../store';
import getMainGoal from '../../helpers/getMainGoal';

const Goal = ({ experiment, onEdit, className }) => {
  const { token } = useStore();
  if (!experiment) return;

  const experimentGoal = getMainGoal(experiment);
  const { status } = experiment;
  const canEditGoal = status === ExperimentStatusesEnum.PENDING;
  const goalDescriptionMapper = {
    PAGE_VISIT: (
      <>
        User visits to{' '}
        {experimentGoal.url_match_type === 'CONTAINS' ? (
          <>
            a page containing "<strong>{experimentGoal.url_match_value}</strong>
            "
          </>
        ) : (
          <a
            href={`${experimentGoal.url_match_value}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {experimentGoal.url_match_value}
          </a>
        )}
      </>
    ),
    CLICK: (
      <>
        User clicks on a{' '}
        {experimentGoal.url_match_value === '*' ? (
          <>
            specific element: <span>{experimentGoal.selector}</span>
          </>
        ) : (
          <a
            href={`${
              typeof experimentGoal.url_match_value === 'string'
                ? experimentGoal.url_match_value
                : ''
            }?stellarMode=true&elementToHighlight=${
              experimentGoal.selector
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
    <div
      className={`${styles.Goal} ${className ? className : ''}`}
      data-goal-id={experimentGoal.id}
    >
      <div className={styles.title}>Goal:</div>
      <div className={styles.goalDescription}>
        {goalDescriptionMapper[experimentGoal.type]}
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
