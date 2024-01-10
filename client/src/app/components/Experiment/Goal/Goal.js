import ExperimentStatusesEnum from '../../../helpers/enums/ExperimentStatusesEnum';
import Edit from '../../../icons/Edit';
import styles from './Goal.module.css';

const Goal = ({ goal, experimentUrl, experimentStatus, onEdit }) => {
  const canEditAttributes =
    experimentStatus !== ExperimentStatusesEnum.RUNNING &&
    experimentStatus !== ExperimentStatusesEnum.COMPLETED;
  const goalDescriptionMapper = {
    PAGE_VISIT: (
      <>
        User visits to{' '}
        <a href={goal.page_url} target="_blank" rel="noopener noreferrer">
          {goal.url_match_value}
        </a>
        .
      </>
    ),
    CLICK: (
      <>
        User clicks on a{' '}
        <a
          href={`${
            experimentUrl + goal.element_url
          }?stellarMode=true&elementToHighlight=${goal.selector}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          specific element
        </a>
        .
      </>
    ),
    SESSION_TIME: <>Time spent by user on the page.</>,
  };

  return (
    <div className={styles.Goal}>
      <div className={styles.title}>Goal:</div>
      <div className={styles.goalDescription}>
        {goalDescriptionMapper[goal.type]}
      </div>
      {canEditAttributes && (
        <div className={styles.edit} onClick={onEdit}>
          <Edit width={17} height={17} />
        </div>
      )}
    </div>
  );
};

export default Goal;
