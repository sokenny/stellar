import React, { useState } from 'react';
import { Snippet, Button as NextUIButton } from '@nextui-org/react';
import useStore from '../../store';
import InfoCard from '../InfoCard';
import Button from '../Button';
import { toast } from 'sonner';
import styles from './SnippetMissing.module.css';
import getStellarClientCode from '../../helpers/getStellarClientCode';

const SnippetMissing = ({ className, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { user, refetchProjects, currentProject } = useStore();
  console.log('currentProject', currentProject);
  const apiKey = user?.api_keys.find(
    (key) => key.project_id === currentProject.id,
  )?.key;

  function handleSnippetCheck() {
    setLoading(true);
    toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_STELLAR_API}/api/check-snippet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url:
            (currentProject.domain.includes('localhost')
              ? 'http://'
              : 'https://') + currentProject.domain,
        }),
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
          return 'Snippet installation confirmed';
        },
        error: async (e) => {
          console.log(e);
          setLoading(false);
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
            <div className={styles.cardTitle}>Snippet missing</div>
            <div>
              Place this snippet inside the {'<head>'} tag of your website to
              start tracking and running your experiments:
            </div>
            <Snippet hideSymbol color="primary" className={styles.cardSnippet}>
              {getStellarClientCode(apiKey)}
            </Snippet>
            <div className={styles.cardActions}>
              {/* <NextUIButton
                color="primary"
                variant="light"
                className={styles.seeHowBtn}
              >
                See how
              </NextUIButton> */}
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
