'use client';

import { useState } from 'react';
import ExperimentStatusesEnum from '../../helpers/enums/ExperimentStatusesEnum';
import Variant from '../Variant/Variant';
import GoalSetupModal from '../GoalSetupModal/GoalSetupModal';
import EditExperimentModal from '../EditExperimentModal/EditExperimentModal';
import Button from '../Button/Button';
import Edit from '../../icons/Edit';
import styles from './Experiment.module.css';

const Goal = ({ goal, experimentStatus, onEdit }) => {
  const canEditAttributes =
    experimentStatus !== ExperimentStatusesEnum.RUNNING &&
    experimentStatus !== ExperimentStatusesEnum.COMPLETED;
  const goalDescriptionMapper = {
    PAGE_VISIT: (
      <>
        User visits to{' '}
        <a href={goal.page_url} target="_blank" rel="noopener noreferrer">
          {goal.page_url}
        </a>
        .
      </>
    ),
    CLICK: (
      <>
        User clicks on a{' '}
        <a
        // href="" we send them to page_url passing the selector in the params and the client side JS will do the rest
        >
          specific element
        </a>
        .
      </>
    ),
    SESSION_TIME: <>Time spent by user on the page.</>,
  };

  return (
    <div className={styles.goal}>
      <div className={styles.goalTitle}>Goal:</div>
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

const Experiment = ({
  experiment,
  journeyId,
  order = null,
  open = true,
  isFirst = false,
}) => {
  const { name, variants, goal, url } = experiment;
  const [isOpen, setIsOpen] = useState(open);
  const [showSetUpGoalModal, setShowSetUpGoalModal] = useState(false);
  const [showEditExperimentModal, setShowEditExperimentModal] = useState(false);

  const nonControlVariants = variants.filter((v) => !v.is_control);

  nonControlVariants.sort((a, b) => {
    if (a.id > b.id) return -1;
    if (a.id < b.id) return 1;
    return 0;
  });

  const sortedVariants = [
    variants.find((v) => v.is_control),
    ...nonControlVariants,
  ];

  sortedVariants.forEach((v, i) => {
    v.num = i + 1;
  });

  return (
    <div
      className={`${styles.Experiment} ${
        isOpen ? styles.isOpen : styles.isClosed
      }
      ${isFirst ? styles.isFirst : ''}
      ${styles[experiment.status]}
      `}
    >
      <div className={styles.header}>
        <div className={styles.colLeft}>
          <div className={styles.order}>{order}</div>
          <div className={styles.name}>{name}</div>
          <div
            className={styles.editExperiment}
            onClick={() => setShowEditExperimentModal(true)}
          >
            <Edit />
          </div>
        </div>

        <div className={styles.colRight}>
          <div className={styles.status}>
            {/* TODO: For queued ones, add tooltip saying "will start when experiment X finishes" */}
            {experiment.status}
          </div>
          {!isOpen && (
            <div className={styles.viewDetails} onClick={() => setIsOpen(true)}>
              View Details
            </div>
          )}
        </div>
      </div>

      {experiment.started_at && (
        <div className={styles.dates}>
          <div className={styles.date}>
            <div className={styles.dateLabel}>Start date:</div>
            <div className={styles.dateValue}>
              {new Date(experiment.start_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div>
          <div className={styles.variants}>
            <div className={styles.variantsTitle}>Variants</div>
            <div className={styles.variantsContainer}>
              {sortedVariants.map((variant, i) => (
                <Variant
                  key={variant.id}
                  id={variant.id}
                  variants={variants}
                  experimentStatus={experiment.status}
                  n={i + 1}
                />
              ))}
            </div>
          </div>
          {goal ? (
            <Goal
              goal={goal}
              experimentStatus={experiment.status}
              onEdit={() => setShowSetUpGoalModal(true)}
            />
          ) : (
            <div>
              <Button
                className={styles.setUpGoalBtn}
                onClick={() => setShowSetUpGoalModal(true)}
              >
                Set up goal
              </Button>
            </div>
          )}
        </div>
      )}
      {showSetUpGoalModal && (
        <GoalSetupModal
          journeyId={journeyId}
          experiment={experiment}
          onClose={() => setShowSetUpGoalModal(false)}
          goal={goal}
        />
      )}
      {showEditExperimentModal && (
        <EditExperimentModal
          onClose={() => setShowEditExperimentModal(false)}
          initialValues={{
            name: experiment.name,
            order,
          }}
          experiment={experiment}
          journeyId={journeyId}
        />
      )}
    </div>
  );
};

export default Experiment;
