import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import { Tooltip } from '@nextui-org/react';
import Edit from '../../icons/Edit';
import styles from './Goal.module.css';

const Goal = ({ experiment, onEdit, className }) => {
  if (!experiment) return;

  const { goal, url, status } = experiment;
  const canEditGoal = status === ExperimentStatusesEnum.PENDING;
  const goalDescriptionMapper = {
    PAGE_VISIT: (
      <>
        User visits to{' '}
        <a
          href={`${url}${goal.url_match_value}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {goal.url_match_value}
        </a>
        .
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
            href={`${url}${
              typeof goal.url_match_value === 'string'
                ? goal.url_match_value
                : ''
            }?stellarMode=true&elementToHighlight=${goal.selector}`}
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
        <span>Time spent</span> by user on the page.
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
            <Edit width={17} height={17} />
          </div>
        </Tooltip>
      )}
    </div>
  );
};

export default Goal;
