'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import Link from 'next/link';
import Variant from '../Variant/Variant';
import Button from '../Button/Button';
import GoalsForm from '../GoalsForm/GoalsForm';
import styles from './Experiment.module.css';

const Goal = ({ goal }) => {
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
      <div
        className={styles.edit}
        onClick={() => router.push(`/set-goal/${goal.experiment_id}`)}
      >
        edit
      </div>
    </div>
  );
};

// TODO: unificar journey/47/review y journey/47/. Que vaya desde "Go Stellar" a "Review & Launch"
// TODO: allow editing the experiment order
// TODO: have click on edit goal open up a modal located in route /journey/:id/goal/:experiment-id or similar
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
  // const [showGoalsForm, setShowGoalsForm] = useState(false);

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
          <div className={styles.order}>#n</div>
          {!isOpen && (
            <div className={styles.button} onClick={() => setIsOpen(true)}>
              View Details
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div>
          {/* TODO-p1: get rid of start_date and end_date columns, switch them for "order" column */}
          {/* <div className={styles.dates}>
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
          </div> */}
          <div className={styles.variants}>
            <div className={styles.variantsTitle}>Variants</div>
            <div className={styles.variantsContainer}>
              {variants.map((variant, i) => (
                <Variant key={variant.id} variant={variant} n={i + 1} />
              ))}
            </div>
          </div>
          {goal && <Goal goal={goal} />}
        </div>
      )}
    </div>
  );
};

export default Experiment;
