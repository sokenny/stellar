'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import Link from 'next/link';
import Variant from '../Variant/Variant';
import GoalSetupModal from '../GoalSetupModal/GoalSetupModal';
import Button from '../Button/Button';
import GoalsForm from '../GoalsForm/GoalsForm';
import styles from './Experiment.module.css';

const Goal = ({ goal, onEdit }) => {
  const router = useRouter();
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
      <div className={styles.edit} onClick={onEdit}>
        edit
      </div>
    </div>
  );
};

// TODO: allow editing the experiment order
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

  return (
    <div
      className={`${styles.Experiment} ${
        isOpen ? styles.isOpen : styles.isClosed
      }
      ${isFirst ? styles.isFirst : ''}
      `}
    >
      <div className={styles.header}>
        <div className={styles.colLeft}>
          <div className={styles.order}>{order}</div>
          <div className={styles.name}>{name}</div>
          <div className={styles.editExperiment}>(edit)</div>
        </div>

        <div className={styles.colRight}>
          <div className={styles.startOrder}>
            {/* TODO: For queued ones, add tooltip saying "will start when experiment X finishes" */}
            {isFirst ? 'Starts Now' : 'Queued'}
          </div>
          {!isOpen && (
            <div className={styles.viewDetails} onClick={() => setIsOpen(true)}>
              View Details
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div>
          <div className={styles.variants}>
            <div className={styles.variantsTitle}>Variants</div>
            <div className={styles.variantsContainer}>
              {variants.map((variant, i) => (
                <Variant key={variant.id} variant={variant} n={i + 1} />
              ))}
            </div>
          </div>
          {goal ? (
            <Goal goal={goal} onEdit={() => setShowSetUpGoalModal(true)} />
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
    </div>
  );
};

export default Experiment;
