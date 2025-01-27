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
  Button as NextUIButton,
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
import isUrlFromDomain from '../../helpers/isUrlFromDomain';

const matchTypes = [
  { key: UrlMatchTypesEnum.CONTAINS, label: 'Contains' },
  { key: UrlMatchTypesEnum.EXACT, label: 'Exact' },
];

const goals = [
  {
    title: 'Clicks',
    description: 'Clicks on a particular element of your website',
    icon: <Click width={22} height={22} />,
    value: GoalTypesEnum.CLICK,
  },
  {
    title: 'Page Visit',
    description: 'Visits to a particular page on your website',
    icon: <Page width={22} height={22} />,
    value: GoalTypesEnum.PAGE_VISIT,
  },
  // {
  //   title: 'Time on Page',
  //   description: 'How long users spend on a particular page',
  //   icon: <Time width={22} height={22} />,
  //   value: GoalTypesEnum.SESSION_TIME,
  // },
];

const GoalsForm = ({ experiment, goal, onClose }) => {
  const { refetchProjects, token, currentProject } = useStore();
  const domain = currentProject.domain;
  const initialGoalName = goal?.name ? goal.name : 'Untitled Goal';
  const goalCheckIntervalRef = useRef(null);
  const toastSuccessCalledRef = useRef(false);
  const [wantsToUpdateGoal, setWantsToUpdateGoal] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const [selectedClickOption, setSelectedClickOption] =
    useState('query-selector');
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
    name: goal?.name ? goal.name : 'Untitled Goal',
  });

  const isGoalNamePristine = formData.name === initialGoalName;
  const isEditingName = goal && !isGoalNamePristine;

  console.log('isGoalNamePristine:', isGoalNamePristine);

  console.log('formData.urlMatchValue:', formData.urlMatchValue);

  function canSubmit() {
    if (!formData.name.trim()) {
      return false;
    }

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

    if (isEditingName) {
      return true;
    }

    return false;
  }

  async function onSetGoal() {
    try {
      const isQuerySelector =
        selectedClickOption === 'query-selector' &&
        formData.goalType === GoalTypesEnum.CLICK;

      setSubmiting(true);
      const baseUrl = process.env.NEXT_PUBLIC_STELLAR_API + '/api/goals';
      const urlToUse = goal?.id ? `${baseUrl}/${goal.id}` : baseUrl;

      const response = await fetch(urlToUse, {
        method: goal?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: goal?.id,
          experiment_id: experiment?.id,
          name: formData.name.trim(),
          type: formData.goalType,
          url_match_type: matchType,
          url_match_value: isQuerySelector
            ? '*' // For now, query selectors provided here have effect on every page. So ideally they must be unique
            : formData.urlMatchValue,
          element_url: '/' + formData.elementUrl,
          selector: isQuerySelector ? querySelector : null,
        }),
      });

      if (response.status === 200) {
        await refetchProjects();

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
      `${formData.elementUrl}?stellarMode=true&experimentId=${experiment.id}&isSettingGoal=true&token=${token}&goalName=${formData.name}&fromUrl=${window.location.href}`,
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

  const isClickAndManualSelect =
    formData.goalType === GoalTypesEnum.CLICK &&
    selectedClickOption === 'manual';

  const showActions =
    (!isClickAndManualSelect && goal?.type !== formData.goalType) ||
    wantsToUpdateGoal ||
    isEditingName;

  return (
    <section className={styles.GoalsForm}>
      <div className={styles.goalNameInput}>
        <label className={styles.goalNameLabel}>Goal Name</label>
        <NInput
          size="sm"
          type="text"
          placeholder="e.g. Checkout Complete"
          className={styles.querySelectorInput}
          onValueChange={(value) => setFormData({ ...formData, name: value })}
          value={formData.name}
        />
      </div>
      {experiment && (
        <div className={styles.subTitle}>
          What valuable action should we track to measure success in your{' '}
          <Link
            href={`/experiment/${experiment.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {experiment.name}
          </Link>{' '}
          experiment?
        </div>
      )}

      <div className={styles.goals}>
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
                <Radio value="query-selector">Query selector</Radio>
                <Radio value="manual">Manual select</Radio>
              </RadioGroup>
              {selectedClickOption === 'query-selector' && (
                <div className={styles.querySelect}>
                  <div className={styles.title}>
                    Provide a valid query selector for the element.
                  </div>
                  <div className={styles.detail}>
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
                  <div className={styles.detail}>
                    After typing in your URL, we'll take you there so you can
                    select this element for us to track.
                  </div>
                  <div className={styles.row}>
                    <Input
                      className={styles.input}
                      type="text"
                      value={formData.elementUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, elementUrl: e.target.value })
                      }
                      placeholder={`https://${domain}/your-page`}
                    />
                    <Button
                      onClick={onGoToUrl}
                      disabled={
                        !formData.elementUrl ||
                        !isUrlFromDomain(formData.elementUrl, domain)
                      }
                      className={styles.goButton}
                    >
                      Go
                    </Button>
                  </div>
                  {formData.elementUrl &&
                    !isUrlFromDomain(formData.elementUrl, domain) && (
                      <div className={styles.error}>
                        URL must be part of{' '}
                        <a
                          href={`https://${domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {domain}
                        </a>
                      </div>
                    )}
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
                <div className={styles.matchTypeSelectContainer}>
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
                <NInput
                  className={styles.pageVisitUrlInput}
                  size="sm"
                  type="text"
                  value={formData.urlMatchValue}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      urlMatchValue: e.target.value,
                    })
                  }
                  placeholder={
                    matchType === UrlMatchTypesEnum.EXACT
                      ? `https://www.${domain}/thank-you`
                      : 'thank-you'
                  }
                />
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
      {showActions && (
        <div className={styles.actions}>
          <NextUIButton
            variant="light"
            onPress={onClose}
            className={styles.button}
          >
            Cancel
          </NextUIButton>
          <Button
            className={styles.continueButton}
            loading={submiting}
            disabled={!canSubmit() || submiting}
            onClick={() => {
              onSetGoal();
            }}
          >
            {/* Create Goal */}
            {goal ? 'Update Goal' : 'Create Goal'}
          </Button>
        </div>
      )}
    </section>
  );
};

export default GoalsForm;
