'use client';

import moment from 'moment';
import { useState } from 'react';
import Link from 'next/link';
import Variant from '../Variant/Variant';
import Button from '../Button/Button';
import GoalsForm from '../GoalsForm/GoalsForm';
import styles from './Experiment.module.css';

const Goal = ({ goal }) => {
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
    </div>
  );
};

const Experiment = ({
  name,
  variants,
  startDate,
  endDate,
  goal,
  url,
  open = true,
}) => {
  const [isOpen, setIsOpen] = useState(open);
  const [showGoalsForm, setShowGoalsForm] = useState(false);

  function getStartsInCopy() {
    const today = moment().startOf('day');
    const start = moment(startDate).startOf('day');
    const diff = start.diff(today, 'days');
    if (diff < 0) {
      return 'starts now';
    }
    return `starts in ${diff} days`;
  }

  const startsIn = getStartsInCopy();

  return (
    <div
      className={`${styles.Experiment} ${
        isOpen ? styles.isOpen : styles.isClosed
      }`}
    >
      <div className={styles.header}>
        <div className={styles.name}>{name}</div>

        <div className={styles.colRight}>
          <div
            className={`${styles.startsIn} ${
              startsIn === 'starts now' ? styles.now : ''
            }`}
          >
            {startsIn}
          </div>
          {isOpen ? (
            <div className={styles.button}>edit</div>
          ) : (
            <div className={styles.button} onClick={() => setIsOpen(true)}>
              View Details
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div>
          <div className={styles.dates}>
            <div>
              Starts:{' '}
              <span className={styles.value}>
                {moment(startDate).format('DD MMM, YYYY')}
              </span>
            </div>
            <div>
              Ends:{' '}
              <span className={styles.value}>
                {moment(endDate).format('DD MMM, YYYY')}
              </span>
            </div>
            <div>
              Url:{' '}
              <Link href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </Link>
            </div>
          </div>
          <div className={styles.variants}>
            <div className={styles.variantsTitle}>Variants</div>
            <div className={styles.variantsContainer}>
              {variants.map((variant, i) => (
                <Variant key={variant.id} variant={variant} n={i + 1} />
              ))}
            </div>
          </div>
          {goal && <Goal goal={goal} />}
          {/* {!goal && !showGoalsForm && (
            <Button
              className={styles.setUpGoal}
              onClick={() => setShowGoalsForm(true)}
            >
              Set up goal
            </Button>
          )} */}

          {showGoalsForm && (
            <GoalsForm domain="caca" experimentId={1} journeyId={2} />
          )}
        </div>
      )}
    </div>
  );
};

export default Experiment;
