import React, { useState } from 'react';
import {
  Snippet,
  Button as NextUIButton,
  Switch,
  Tooltip,
} from '@nextui-org/react';
import useStore from '../../store';
import InfoCard from '../InfoCard';
import Button from '../Button';
import { toast } from 'sonner';
import styles from './SnippetMissing.module.css';
import getStellarClientCode from '../../helpers/getStellarClientCode';

const SnippetMissing = ({
  className,
  onSuccess,
  cardTitle = 'Snippet missing',
}) => {
  const [loading, setLoading] = useState(false);
  const [withAntiFlicker, setWithAntiFlicker] = useState(true);
  const { user, refetchProjects, currentProject } = useStore();
  console.log('user', user);
  console.log('currentProject', currentProject);
  const apiKey = user?.api_keys.find(
    (key) => key.project_id === currentProject.id,
  )?.key;

  function handleSnippetCheck() {
    setLoading(true);
    const url =
      (currentProject.domain.includes('localhost') ? 'http://' : 'https://') +
      currentProject.domain;

    const windowWidth = 500;
    const windowHeight = 600;
    const left = window.screenX + (window.innerWidth - windowWidth) / 2;
    const top = window.screenY + (window.innerHeight - windowHeight) / 2;

    const newWindow = window.open(
      url,
      '_blank',
      `width=${windowWidth},height=${windowHeight},left=${left},top=${top}`,
    );

    toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_STELLAR_API}/api/check-snippet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'An unknown error occurred');
        }
        return response;
      }),
      {
        loading: 'Checking snippet...',
        success: async () => {
          setLoading(false);
          refetchProjects();
          onSuccess && onSuccess();
          newWindow && newWindow.close();
          return 'Snippet installation confirmed';
        },
        error: async (e) => {
          console.log(e);
          setLoading(false);
          newWindow && newWindow.close();
          return e.message || 'Error checking snippet - not found';
        },
      },
    );
  }

  return (
    <InfoCard className={`${styles.container} ${className}`}>
      {
        <div className={styles.cardBody}>
          <div>
            <div className={styles.cardTitle}>{cardTitle}</div>
            <div>
              Place this snippet inside the {'<head>'} tag of your website to
              start tracking and running your experiments:
            </div>
            <div className={styles.switchContainer}>
              <Switch
                defaultSelected={withAntiFlicker}
                onChange={(e) => setWithAntiFlicker(e.target.checked)}
                size="sm"
              >
                <Tooltip
                  content="Enabling this option ensures a smoother experience for your visitors by hiding elements momentarily until the changes are fully applied."
                  showArrow
                  className={styles.tooltip}
                  closeDelay={200}
                >
                  <div>Anti-Flicker</div>
                </Tooltip>
              </Switch>
            </div>
            <Snippet hideSymbol color="primary" className={styles.cardSnippet}>
              {getStellarClientCode(apiKey, withAntiFlicker)}
            </Snippet>
            <div className={styles.cardActions}>
              <NextUIButton
                color="primary"
                variant="light"
                className={styles.seeHowBtn}
                onClick={() => {
                  window.open('/blog/install-stellar-snippet', '_blank');
                }}
              >
                See how
              </NextUIButton>
              <Button onClick={handleSnippetCheck} loading={loading}>
                I've installed it
              </Button>
            </div>
          </div>
        </div>
      }
    </InfoCard>
  );
};

export default SnippetMissing;
