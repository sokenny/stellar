'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input, Switch, Tooltip, Select, SelectItem } from '@nextui-org/react';
import Button from '../../../../components/Button';
import useStore from '../../../../store';
import styles from './SettingsForm.module.css';

const startTriggerTypes = [
  {
    key: 'manual',
    label: 'Manually launch',
  },
  {
    key: 'scheduled_date',
    label: 'Schedule start date',
  },
  {
    key: 'queue_after',
    label: 'Queue after another experiment',
  },
];

const endTriggerTypes = [
  {
    key: 'manual',
    label: 'Manually end',
  },
  {
    key: 'scheduled_date',
    label: 'Schedule end date',
  },
  {
    key: 'auto_finalize',
    label: 'Auto finalize',
  },
];

function getStartTriggerType(experiment) {
  if (experiment.scheduled_start_date) {
    return 'scheduled_date';
  }
  if (experiment.queue_after) {
    return 'queue_after';
  }
  return 'manual';
}

function getEndTriggerType(experiment) {
  if (experiment.scheduled_end_date) {
    return 'scheduled_date';
  }
  if (experiment.auto_finalize) {
    return 'auto_finalize';
  }
  return 'manual';
}

const SettingsForm = ({ experiment }) => {
  const router = useRouter();
  const { currentProject, refetchProjects } = useStore();
  const otherNonEndedExperiments = currentProject.experiments.filter((exp) => {
    return exp.id !== experiment.id && !exp.ended_at;
  });
  const {
    auto_finalize,
    allow_parallel,
    scheduled_start_date,
    scheduled_end_date,
    queue_after,
  } = experiment;

  const [settingsForm, setSettingsForm] = useState({
    start_trigger_type: getStartTriggerType(experiment),
    end_trigger_type: getEndTriggerType(experiment),
    scheduled_start_date,
    scheduled_end_date,
    queue_after,
    auto_finalize,
    allow_parallel,
  });
  const [submitting, setSubmitting] = useState(false);
  const pristineFormState = useRef(settingsForm);
  const isPristine =
    JSON.stringify(pristineFormState.current) === JSON.stringify(settingsForm);

  function isFormValid() {
    if (settingsForm.start_trigger_type === 'scheduled_date') {
      return settingsForm.scheduled_start_date > new Date().toISOString();
    }
    if (settingsForm.start_trigger_type === 'queue_after') {
      return settingsForm.queue_after;
    }
    if (settingsForm.end_trigger_type === 'scheduled_date') {
      return settingsForm.scheduled_end_date > new Date().toISOString();
    }
    return true;
  }

  function onSubmit() {
    setSubmitting(true);
    fetch(
      `${process.env.NEXT_PUBLIC_STELLAR_API}/api/experiment/${experiment.id}/settings`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsForm),
      },
    )
      .then((res) => res.json())
      .then((res) => {
        pristineFormState.current = settingsForm;
        setSubmitting(false);
        toast.success('Settings saved');
        refetchProjects();
        router.push(`/experiment/${experiment.id}`);
      })
      .catch((err) => {
        setSubmitting(false);
        toast.error('Failed to save settings');
      });
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.startTrigger} ${styles.settingItem}`}>
        <Select
          label={
            <>
              <Tooltip
                content="How do you want to trigger the start of the experiment?"
                showArrow
                className={styles.tooltip}
                closeDelay={200}
                isDisabled={!!experiment.started_at}
              >
                <span>Start trigger</span>
              </Tooltip>
            </>
          }
          radius="none"
          className={styles.select}
          labelPlacement="outside"
          defaultSelectedKeys={[settingsForm.start_trigger_type || 'manual']}
          onSelectionChange={(val) =>
            setSettingsForm({
              ...settingsForm,
              start_trigger_type: val.currentKey,
              scheduled_start_date: null,
              queue_after: null,
            })
          }
          isDisabled={!!experiment.started_at}
        >
          {startTriggerTypes.map((type) => (
            <SelectItem key={type.key}>{type.label}</SelectItem>
          ))}
        </Select>
        {!experiment.started_at &&
          settingsForm.start_trigger_type === 'manual' && (
            <div className={styles.detail}>
              You will manually launch the experiment.
            </div>
          )}
        {!experiment.started_at &&
          settingsForm.start_trigger_type === 'queue_after' && (
            <div className={styles.detail}>
              The experiment will start after another experiment ends.
            </div>
          )}
        {!experiment.started_at &&
          settingsForm.start_trigger_type === 'scheduled_date' && (
            <div className={styles.detail}>
              The experiment will start on the scheduled start date.
            </div>
          )}
      </div>
      {settingsForm.start_trigger_type === 'scheduled_date' && (
        <div className={`${styles.scheduledStartDate} ${styles.settingItem}`}>
          <Input
            type="date"
            label="Scheduled start date"
            placeholder="something"
            labelPlacement="outside"
            className={styles.input}
            value={
              settingsForm.scheduled_start_date
                ? settingsForm.scheduled_start_date.split('T')[0]
                : ''
            }
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                scheduled_start_date: e.target.value,
              })
            }
            isInvalid={
              settingsForm.scheduled_start_date < new Date().toISOString()
            }
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      )}

      {settingsForm.start_trigger_type === 'queue_after' && (
        <div className={styles.settingItem}>
          <Select
            label="Queue after"
            radius="none"
            className={styles.select}
            labelPlacement="outside"
            defaultSelectedKeys={[settingsForm.queue_after?.toString()]}
            placeholder="Select an experiment to queue after"
            onSelectionChange={(val) =>
              setSettingsForm({
                ...settingsForm,
                queue_after: val.currentKey,
              })
            }
          >
            {otherNonEndedExperiments.map((exp) => (
              <SelectItem key={exp.id}>{exp.name}</SelectItem>
            ))}
          </Select>
        </div>
      )}

      <div className={`${styles.endTrigger} ${styles.settingItem}`}>
        <Select
          label={
            <Tooltip
              content="How do you want to trigger the end of the experiment?"
              showArrow
              className={styles.tooltip}
              closeDelay={200}
              isDisabled={!!experiment.ended_at}
            >
              <span>End trigger</span>
            </Tooltip>
          }
          radius="none"
          className={styles.select}
          labelPlacement="outside"
          defaultSelectedKeys={[settingsForm.end_trigger_type || 'manual']}
          onSelectionChange={(val) =>
            setSettingsForm({
              ...settingsForm,
              end_trigger_type: val.currentKey,
              scheduled_end_date: null,
              auto_finalize: false,
            })
          }
          isDisabled={!!experiment.ended_at}
        >
          {endTriggerTypes.map((type) => (
            <SelectItem key={type.key}>{type.label}</SelectItem>
          ))}
        </Select>
        {!experiment.ended_at &&
          settingsForm.end_trigger_type === 'auto_finalize' && (
            <div className={styles.detail}>
              We will automatically end your experiment once statistical
              significance is reached.
            </div>
          )}
        {!experiment.ended_at &&
          settingsForm.end_trigger_type === 'scheduled_date' && (
            <div className={styles.detail}>
              We will automatically end your experiment on the scheduled end
              date.
            </div>
          )}
        {!experiment.ended_at && settingsForm.end_trigger_type === 'manual' && (
          <div className={styles.detail}>
            You will manually end the experiment.
          </div>
        )}
      </div>

      {settingsForm.end_trigger_type === 'scheduled_date' && (
        <div className={styles.settingItem}>
          <Input
            type="date"
            label="Scheduled end date"
            placeholder="something"
            labelPlacement="outside"
            className={styles.input}
            onChange={(e) =>
              setSettingsForm({
                ...settingsForm,
                scheduled_end_date: e.target.value,
              })
            }
            value={
              settingsForm.scheduled_end_date
                ? settingsForm.scheduled_end_date.split('T')[0]
                : ''
            }
            isInvalid={settingsForm.end_date < new Date().toISOString()}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      )}
      <div className={`${styles.settingItem} ${styles.autoFinalizeContainer}`}>
        <div className={styles.autoFinalize}>
          <Switch
            defaultSelected={settingsForm.allow_parallel}
            onValueChange={(val) =>
              setSettingsForm({
                ...settingsForm,
                allow_parallel: val,
              })
            }
            isDisabled={false}
          >
            <div>Allow parallel experiments</div>
          </Switch>
          <div className={styles.detail}>
            By enabling this option, you allow other experiments to run along
            side this one on a same page (not recommended).
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <Button
          onClick={onSubmit}
          loading={submitting}
          disabled={isPristine || !isFormValid()}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default SettingsForm;
