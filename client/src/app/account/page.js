'use client';

import React, { useEffect, useState } from 'react';
import { Checkbox, Spinner } from '@nextui-org/react';
import useStore from '../store';
import styles from './page.module.css';
import DisplaySnippet from '../components/DisplaySnippet';
import { toast } from 'sonner';

export default function Account({}) {
  const { user, refetchProjects } = useStore();
  const [emailSettings, setEmailSettings] = useState({});

  useEffect(() => {
    if (user) {
      setEmailSettings(user.email_settings);
    }
  }, [user]);

  const handleEmailSettingsChange = async (setting) => {
    const updatedSettings = {
      ...emailSettings,
      [setting]: !emailSettings[setting],
    };
    setEmailSettings(updatedSettings);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_STELLAR_API}/api/user/email-settings`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emailSettings: updatedSettings }),
        },
      );
      toast.success('Email settings updated successfully');
      refetchProjects();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update email settings');
    }
  };

  if (!user) {
    return <Spinner size="xl" color="primary" />;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Projects</h3>
      <div className={styles.projects}>
        {user?.projects?.map((project) => {
          const apiKey = user?.api_keys.find(
            (key) => key.project_id === project.id,
          )?.key;
          return (
            <div
              key={project.id}
              className={styles.project}
              data-project-id={project.id}
            >
              <h4>{project.name}</h4>
              <DisplaySnippet apiKey={apiKey} />
            </div>
          );
        })}
      </div>
      <div className={styles.emailPreferences}>
        <h4>Email Preferences</h4>
        <Checkbox
          className={styles.checkbox}
          isSelected={emailSettings?.recommendations}
          onValueChange={() => handleEmailSettingsChange('recommendations')}
        >
          Receive Recommendations
        </Checkbox>
        <Checkbox
          className={styles.checkbox}
          isSelected={emailSettings?.reminders}
          onValueChange={() => handleEmailSettingsChange('reminders')}
        >
          Receive Reminders
        </Checkbox>
      </div>
    </div>
  );
}
