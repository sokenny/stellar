'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '../Button/Button';
import styles from './GoalsForm.module.css';

const goals = [
  {
    title: 'Clicks',
    description: 'Clicks on a particular element of your website',
    icon: 'i',
    value: 'CLICK',
  },
  {
    title: 'Page Visit',
    description: 'Visits to a particular page on your website',
    icon: 'i',
    value: 'PAGE_VISIT',
  },
  {
    title: 'Time on Page',
    description: 'How long users spend on a particular page',
    icon: 'i',
    value: 'SESSION_TIME',
  },
];

const GoalsForm = ({ domain, experimentId, journeyId }) => {
  const router = useRouter();
  const [submiting, setSubmiting] = useState(false);
  const [goalType, setGoalType] = useState(null);
  const [visitUrl, setVisitUrl] = useState(null);
  const visitUrlIsValid = false;
  const clickElementSelected = false;

  const inJourney = !!journeyId;

  function canContinue() {
    if (goalType === 'SESSION_TIME') {
      return true;
    }

    if (goalType === 'CLICK' && clickElementSelected) {
      return true;
    }

    if (goalType === 'PAGE_VISIT' && visitUrl && visitUrlIsValid) {
      return true;
    }
  }

  async function onReviewAndLaunch() {
    // send goals data to server
    console.log('funcion llamada! ');

    try {
      setSubmiting(true);
      const response = await fetch('http://localhost:3001/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experimentId,
          type: goalType,
          selector: null,
          page_url: visitUrl,
        }),
      });

      if (inJourney) {
        router.push(`/journey/${journeyId}/review`);
      } else {
        router.push(`/experiment/${experimentId}/review`);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSubmiting(false);
    }
  }

  return (
    <section className={styles.GoalsForm}>
      <div className={styles.goals}>
        {goals.map((goal) => (
          <div
            className={`${styles.goal} ${
              goalType === goal.value ? styles.selected : ''
            }`}
            onClick={() => setGoalType(goal.value)}
            key={goal.value}
          >
            <div className={styles.icon}>{goal.icon}</div>
            <h3 className={styles.goalTitle}>{goal.title}</h3>
            <h3 className={styles.goalDescription}>{goal.description}</h3>
          </div>
        ))}
      </div>
      <div className={styles.additionalData}>
        {/* TODO: Finish this part of the flow */}
        {goalType === 'CLICK' && (
          <div className={styles.clickData}>
            <div className={styles.title}>Which URL is the element at?</div>
            <div className={styles.subTitle}>
              After typing in your URL, we'll take you there so you can select
              this element for us to track.{' '}
              <span className={styles.link}>See how</span>.
            </div>
            <div className={styles.row}>
              <div className={styles.domain}>{domain}/</div>
              <input className={styles.input} type="text" />
              <Button>Go</Button>
            </div>
          </div>
        )}
        {/* TODO: Finish this part of the flow */}
        {goalType === 'PAGE_VISIT' && (
          <div className={styles.clickData}>
            <div className={styles.title}>
              Which URL visit should we track as a goal completion?
            </div>
            <div className={styles.row}>
              <div className={styles.domain}>{domain}/</div>
              <input className={styles.input} type="text" />
              <Button>Go</Button>
            </div>
          </div>
        )}
      </div>
      {canContinue() && (
        <Button
          className={styles.continueButton}
          loading={submiting}
          disabled={submiting}
          onClick={onReviewAndLaunch}
        >
          Review & Launch Experiments
        </Button>
      )}
    </section>
  );
};

export default GoalsForm;