import React, { useState } from 'react';
import { Snippet, Button as NextUIButton } from '@nextui-org/react';
import useStore from '../../store';
import InfoCard from '../InfoCard';
import Button from '../Button';
import { toast } from 'sonner';
import styles from './SnippetMissing.module.css';

const SnippetMissing = ({ className }) => {
  const [loading, setLoading] = useState(false);
  const { refetchProjects, currentProject } = useStore();
  function handleSnippetCheck() {
    setLoading(true);
    toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_STELLAR_API}/check-snippet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'http://' + currentProject.domain,
        }),
      }),
      {
        loading: 'Checking snippet...',
        success: async () => {
          setLoading(false);
          refetchProjects();
          return 'Snippet installation confirmed';
        },
        error: async () => {
          setLoading(false);
          return 'Error checking snippet - not found';
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
              Place this snippet in the {'<head>'} tag of your website to start
              tracking and running your experiments:
            </div>
            <Snippet hideSymbol color="primary" className={styles.cardSnippet}>
              {
                '<script async src="http://localhost:3001/api/clientjs" data-stellar-api-key="your_api_public_key"></script>'
              }
            </Snippet>
            <div className={styles.cardActions}>
              <NextUIButton
                color="primary"
                variant="light"
                className={styles.seeHowBtn}
              >
                {/* TODO-p2: Armar pagina mostrando como instalarlo */}
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