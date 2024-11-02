import React, { useState } from 'react';
import { Snippet, Switch, Tooltip } from '@nextui-org/react';
import InfoCard from '../InfoCard';
import styles from './DisplaySnippet.module.css';
import getStellarClientCode from '../../helpers/getStellarClientCode';

const DisplaySnippet = ({ className, apiKey }) => {
  const [withAntiFlicker, setWithAntiFlicker] = useState(true);

  return (
    <InfoCard className={`${styles.container} ${className}`}>
      <div className={styles.cardBody}>
        <div>
          <div className={styles.cardTitle}>Snippet</div>
          {/* <div>
            Place this snippet inside the {'<head>'} tag of your website to
            start tracking and running your experiments:
          </div> */}
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
          {/* TODO-p1-1: Create a check status button */}
          <Snippet hideSymbol color="primary" className={styles.cardSnippet}>
            {getStellarClientCode(apiKey, withAntiFlicker)}
          </Snippet>
        </div>
      </div>
    </InfoCard>
  );
};

export default DisplaySnippet;
