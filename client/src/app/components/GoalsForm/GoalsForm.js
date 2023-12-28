'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import GoalTypesEnum from '../../helpers/enums/GoalTypesEnum';
import getDomainFromUrl from '../../helpers/getDomainFromUrl';
import getPathAndQueryFromUrl from '../../helpers/getPathAndQueryFromUrl';
import Link from 'next/link';
import Button from '../Button/Button';
import Input from '../Input/Input';
import styles from './GoalsForm.module.css';

const goals = [
  {
    title: 'Clicks',
    description: 'Clicks on a particular element of your website',
    icon: 'i',
    value: GoalTypesEnum.CLICK,
  },
  {
    title: 'Page Visit',
    description: 'Visits to a particular page on your website',
    icon: 'i',
    value: GoalTypesEnum.PAGE_VISIT,
  },
  {
    title: 'Time on Page',
    description: 'How long users spend on a particular page',
    icon: 'i',
    value: GoalTypesEnum.SESSION_TIME,
  },
];

const GoalsForm = ({ experiment, journeyId, goal, onClose }) => {
  const domain = getDomainFromUrl(experiment.url);
  const router = useRouter();
  const [wantsToUpdateGoal, setWantsToUpdateGoal] = useState(false);
  const [submiting, setSubmiting] = useState(false);

  function getDefaultVisitUrl() {
    if (goal?.type === GoalTypesEnum.PAGE_VISIT && goal?.page_url) {
      return getPathAndQueryFromUrl(goal.page_url);
    }
    return '';
  }

  const [formData, setFormData] = useState({
    goalType: goal?.type ? goal.type : null,
    visitUrlPath: getDefaultVisitUrl(),
  });

  function canContinue() {
    if (formData.goalType === GoalTypesEnum.SESSION_TIME) {
      if (formData.goalType === goal?.type) {
        return false;
      }
      return true;
    }

    if (
      formData.goalType === GoalTypesEnum.PAGE_VISIT &&
      formData.visitUrlPath &&
      formData.visitUrlPath !== ''
    ) {
      return true;
    }
  }

  async function onSetGoal() {
    try {
      setSubmiting(true);
      const response = await fetch('http://localhost:3001/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          experiment_id: experiment.id,
          journey_id: journeyId,
          type: formData.goalType,
          page_url: getDomainFromUrl(experiment.url) + formData.visitUrlPath,
          selector: null,
        }),
      });

      if (response.status !== 200) {
        alert('Something went wrong');
        throw new Error('Something went wrong');
      } else {
        router.refresh();
        onClose();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSubmiting(false);
    }
  }

  function onGoToUrl() {
    // open http://localhost:3002?stellarMode=true&experimentId=${experiment.id} in a new tab
    console.log('Go to URL');
    window.open(
      `http://localhost:3002?stellarMode=true&experimentId=${experiment.id}`,
      '_blank',
    );
  }

  // TODO: validate the url entered
  function onSetUrl() {
    // test that formData.visitUrl is a valid url
  }

  return (
    <section className={styles.GoalsForm}>
      <div className={styles.goals}>
        {goals.map((goal) => (
          <div
            className={`${styles.goal} ${
              formData.goalType === goal.value ? styles.selected : ''
            }`}
            onClick={() => setFormData({ ...formData, goalType: goal.value })}
            key={goal.value}
          >
            <div className={styles.icon}>{goal.icon}</div>
            <h3 className={styles.goalTitle}>{goal.title}</h3>
            <h3 className={styles.goalDescription}>{goal.description}</h3>
          </div>
        ))}
      </div>
      <div className={styles.additionalData}>
        {formData.goalType === GoalTypesEnum.CLICK &&
          (goal?.type !== GoalTypesEnum.CLICK || wantsToUpdateGoal) && (
            <div className={styles.clickData}>
              <div className={styles.title}>Which URL is the element at?</div>
              <div className={styles.subTitle}>
                After typing in your URL, we'll take you there so you can select
                this element for us to track.{' '}
                <span className={styles.link}>See how</span>.
              </div>
              <div className={styles.row}>
                <div className={styles.domain}>{domain}</div>
                <Input type="text" />
                <Button onClick={onGoToUrl} disabled={false}>
                  Go
                </Button>
              </div>
            </div>
          )}
        {formData.goalType === GoalTypesEnum.CLICK &&
          goal?.type === GoalTypesEnum.CLICK &&
          !wantsToUpdateGoal && (
            <div className={styles.currentGoal}>
              <div className={styles.title}>
                Currently tracking clicks for{' '}
                <Link href="">specific element</Link>.
              </div>
              <Button onClick={() => setWantsToUpdateGoal(true)}>
                Set Different Element
              </Button>
            </div>
          )}
        {formData.goalType === GoalTypesEnum.PAGE_VISIT &&
          (goal?.type !== GoalTypesEnum.PAGE_VISIT || wantsToUpdateGoal) && (
            <div className={styles.clickData}>
              <div className={styles.title}>
                Which URL visit should we track as a goal completion?
              </div>
              <div className={styles.row}>
                <div className={styles.domain}>{domain}</div>
                <Input
                  className={styles.visitUrlPathInput}
                  type="text"
                  value={formData.visitUrlPath}
                  onChange={(e) =>
                    setFormData({ ...formData, visitUrlPath: e.target.value })
                  }
                  placeholder="thank-you"
                />
                {/* <Button onClick={onSetUrl}>Set Url</Button> */}
              </div>
            </div>
          )}
        {formData.goalType === GoalTypesEnum.PAGE_VISIT &&
          goal?.type === GoalTypesEnum.PAGE_VISIT &&
          !wantsToUpdateGoal && (
            <div className={styles.currentGoal}>
              <div className={styles.title}>
                Currently tracking user visits to{' '}
                <Link href="">{goal?.page_url}</Link>.
              </div>
              <Button onClick={() => setWantsToUpdateGoal(true)}>
                Set Different Url
              </Button>
            </div>
          )}
      </div>
      {formData.goalType !== GoalTypesEnum.CLICK ||
        (goal && wantsToUpdateGoal && (
          <div className={styles.actions}>
            <Button
              className={styles.continueButton}
              loading={submiting}
              disabled={!canContinue() || submiting}
              onClick={onSetGoal}
            >
              Set Goal
            </Button>
            <div className={styles.cancel} onClick={onClose}>
              cancel
            </div>
          </div>
        ))}
    </section>
  );
};

export default GoalsForm;
