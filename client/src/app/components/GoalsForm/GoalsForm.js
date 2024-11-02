'use client';

import { toast } from 'sonner';
import useStore from '../../store';
import { useEffect, useState, useRef } from 'react';
import {
  RadioGroup,
  Radio,
  Input as NInput,
  Select,
  SelectItem,
  Tooltip,
} from '@nextui-org/react';
import GoalTypesEnum from '../../helpers/enums/GoalTypesEnum';
import UrlMatchTypesEnum from '../../helpers/enums/UrlMatchTypesEnum';
import getDomainFromUrl from '../../helpers/getDomainFromUrl';
import Link from 'next/link';
import Button from '../Button/Button';
import Click from '../../icons/Click';
import GA from '../../icons/GA';
import Time from '../../icons/Time';
import Input from '../Input/Input';
import styles from './GoalsForm.module.css';
import Page from '../../icons/Page';
import segmentTrack from '../../helpers/segment/segmentTrack';

const matchTypes = [
  { key: UrlMatchTypesEnum.CONTAINS, label: 'Contains' },
  { key: UrlMatchTypesEnum.EXACT, label: 'Exact' },
];

const goals = [
  {
    title: 'Clicks',
    description: 'Clicks on a particular element of your website',
    icon: <Click width={25} height={25} />,
    value: GoalTypesEnum.CLICK,
  },
  {
    title: 'Page Visit',
    description: 'Visits to a particular page on your website',
    icon: <Page width={25} height={25} />,
    value: GoalTypesEnum.PAGE_VISIT,
  },
  {
    title: 'Time on Page',
    description: 'How long users spend on a particular page',
    icon: <Time width={25} height={25} />,
    value: GoalTypesEnum.SESSION_TIME,
  },
];

const GoalsForm = ({ experiment, goal, onClose }) => {
  const { refetchProjects, token } = useStore();
  const domain = getDomainFromUrl(experiment.url);
  const goalCheckIntervalRef = useRef(null);
  const toastSuccessCalledRef = useRef(false);
  const [wantsToUpdateGoal, setWantsToUpdateGoal] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const [selectedClickOption, setSelectedClickOption] = useState('manual');
  const [querySelector, setQuerySelector] = useState('');
  const [matchType, setMatchType] = useState(UrlMatchTypesEnum.CONTAINS);

  useEffect(() => {
    return () => clearInterval(goalCheckIntervalRef.current);
  }, []);

  const [formData, setFormData] = useState({
    goalType: goal?.type ? goal.type : '',
    urlMatchType: goal?.url_match_type ? goal.url_match_type : '',
    urlMatchValue: goal?.url_match_value ? goal.url_match_value : '',
    elementUrl: goal?.element_url ? goal.element_url : '',
  });

  console.log('formData.urlMatchValue:', formData.urlMatchValue);

  function canContinue() {
    if (formData.goalType === GoalTypesEnum.SESSION_TIME) {
      if (formData.goalType === goal?.type) {
        return false;
      }
      return true;
    }

    if (
      formData.goalType === GoalTypesEnum.PAGE_VISIT &&
      formData.urlMatchValue &&
      formData.urlMatchValue !== ''
    ) {
      return true;
    }

    if (
      formData.goalType === GoalTypesEnum.CLICK &&
      selectedClickOption === 'query-selector' &&
      querySelector !== ''
    ) {
      return true;
    }
  }

  async function onSetGoal() {
    try {
      const isQuerySelector =
        selectedClickOption === 'query-selector' &&
        formData.goalType === GoalTypesEnum.CLICK;

      setSubmiting(true);
      const response = await fetch(
        process.env.NEXT_PUBLIC_STELLAR_API + '/api/goals',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            experiment_id: experiment.id,
            type: formData.goalType,
            url_match_type:
              formData.goalType === GoalTypesEnum.SESSION_TIME
                ? matchType
                : UrlMatchTypesEnum.CONTAINS,
            url_match_value: isQuerySelector
              ? '*' // For now, query selectors provided here have effect on every page. So ideally they must be unique
              : formData.urlMatchValue,
            element_url: '/' + formData.elementUrl,
            selector: isQuerySelector ? querySelector : null,
          }),
        },
      );

      if (response.status === 200) {
        await refetchProjects();
        console.log('caca1');
        if (!toastSuccessCalledRef.current) {
          toast.success('Goal set successfully');
          toastSuccessCalledRef.current = true;
        }
        onClose();
      } else {
        alert('Something went wrong');
        throw new Error('Something went wrong');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setSubmiting(false);
    }
  }

  async function onGoToUrl() {
    const initialGoalUpdatedAt = goal?.updated_at;
    window.open(
      `http://${
        getDomainFromUrl(experiment.url) + '/' + formData.elementUrl
      }?stellarMode=true&experimentId=${
        experiment.id
      }&isSettingGoal=true&token=${token}`,
      '_blank',
    );

    goalCheckIntervalRef.current = setInterval(async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experiment.id}`,
      );
      const experimentJson = await res.json();
      if (experimentJson?.goal?.updated_at !== initialGoalUpdatedAt) {
        clearInterval(goalCheckIntervalRef.current);
        onClose();
        refetchProjects();
        if (!toastSuccessCalledRef.current) {
          toast.success('Goal set successfully');
          toastSuccessCalledRef.current = true;
        }
      }
    }, 1500);
  }

  // TODO: validate the url entered
  function onSetUrl() {
    // test that formData.visitUrl is a valid url
  }

  const isClickAndManualSelect =
    formData.goalType === GoalTypesEnum.CLICK &&
    selectedClickOption === 'manual';

  const showSetGoal =
    (!isClickAndManualSelect && goal?.type !== formData.goalType) ||
    wantsToUpdateGoal;

  return (
    <section className={styles.GoalsForm}>
      <div className={styles.goals}>
        <Tooltip
          content={'This feature will soon be available'}
          showArrow
          className={styles.tooltip}
          closeDelay={200}
        >
          <div className={styles.gaGoal}>
            <GA width={30} height={30} />
            Import from Google Analytics
          </div>
        </Tooltip>
        <div className={styles.classicGoals}>
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
      </div>
      <div className={styles.additionalData}>
        {formData.goalType === GoalTypesEnum.CLICK &&
          (goal?.type !== GoalTypesEnum.CLICK || wantsToUpdateGoal) && (
            <div className={styles.clickData}>
              <RadioGroup
                color="primary"
                orientation="horizontal"
                className={styles.radioGroup}
                value={selectedClickOption}
                onValueChange={setSelectedClickOption}
              >
                <Radio value="manual">Manual select</Radio>
                <Radio value="query-selector">Query selector</Radio>
              </RadioGroup>
              {selectedClickOption === 'query-selector' && (
                <div className={styles.querySelect}>
                  <div className={styles.title}>
                    Provide a valid query selector for the element.
                  </div>
                  <div className={styles.subTitle}>
                    A conversion will be triggered once a user clicks on this
                    element.
                  </div>
                  <NInput
                    size="sm"
                    type="text"
                    placeholder="#subscribe-button"
                    className={styles.querySelectorInput}
                    onValueChange={setQuerySelector}
                    value={querySelector}
                  />
                </div>
              )}
              {selectedClickOption === 'manual' && (
                <div className={styles.manualSelect}>
                  <div className={styles.title}>
                    Which URL is the element at?
                  </div>
                  <div className={styles.subTitle}>
                    After typing in your URL, we'll take you there so you can
                    select this element for us to track.{' '}
                    {/* <span className={styles.link}>See how</span>. */}
                  </div>
                  <div className={styles.row}>
                    <div className={styles.domain}>{domain}/</div>
                    <Input
                      className={styles.input}
                      type="text"
                      value={formData.elementUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, elementUrl: e.target.value })
                      }
                    />
                    <Button
                      onClick={onGoToUrl}
                      disabled={false}
                      className={styles.goButton}
                    >
                      Go
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        {formData.goalType === GoalTypesEnum.CLICK &&
          goal?.type === GoalTypesEnum.CLICK &&
          !wantsToUpdateGoal && (
            <div className={styles.currentGoal}>
              <div className={styles.title}>
                {' '}
                Currently tracking clicks for{' '}
                <a
                  href={`${goal.url_match_value}?stellarMode=true&elementToHighlight=${goal.selector}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  specific element
                </a>
                .
              </div>
              <Button onClick={() => setWantsToUpdateGoal(true)}>
                Set Different Element
              </Button>
            </div>
          )}
        {formData.goalType === GoalTypesEnum.PAGE_VISIT &&
          (goal?.type !== GoalTypesEnum.PAGE_VISIT || wantsToUpdateGoal) && (
            <div className={styles.pageVisitData}>
              <div className={styles.title}>
                Which URL visit should we track as a goal completion?
              </div>

              <div className={styles.pageVisitUrlContainer}>
                <div>
                  <Select
                    label="Match type"
                    radius="none"
                    className={styles.matchTypeSelect}
                    defaultSelectedKeys={[matchType]}
                    onSelectionChange={(val) => setMatchType(val.currentKey)}
                  >
                    {matchTypes.map((matchType) => (
                      <SelectItem key={matchType.key}>
                        {matchType.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className={styles.row}>
                  {matchType === UrlMatchTypesEnum.EXACT && (
                    <div className={styles.domain}>{domain}/</div>
                  )}
                  <Input
                    className={styles.input}
                    type="text"
                    value={formData.urlMatchValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        urlMatchValue: e.target.value,
                      })
                    }
                    placeholder="thank-you"
                  />
                </div>
              </div>
            </div>
          )}
        {formData.goalType === GoalTypesEnum.PAGE_VISIT &&
          goal?.type === GoalTypesEnum.PAGE_VISIT &&
          !wantsToUpdateGoal && (
            <div className={styles.currentGoal}>
              <div className={styles.title}>
                Currently tracking user visits to{' '}
                {goal?.url_match_type === UrlMatchTypesEnum.EXACT
                  ? 'urls that match exactly'
                  : 'urls that contain'}{' '}
                <Link href="">{goal?.url_match_value}</Link>.
              </div>
              <Button onClick={() => setWantsToUpdateGoal(true)}>
                Set Different Url
              </Button>
            </div>
          )}
      </div>
      {showSetGoal && (
        <div className={styles.actions}>
          <Button
            className={styles.continueButton}
            loading={submiting}
            disabled={!canContinue() || submiting}
            onClick={() => {
              segmentTrack('experiment_goal_set', {
                experimentId: experiment.id,
                goalType: formData.goalType,
              });
              onSetGoal();
            }}
          >
            Set Goal
          </Button>
          <div className={styles.cancel} onClick={onClose}>
            cancel
          </div>
        </div>
      )}
    </section>
  );
};

export default GoalsForm;
