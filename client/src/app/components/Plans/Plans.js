'use client';

import { Button } from '@nextui-org/react';
import { signIn } from 'next-auth/react';
import Check from '../../icons/Check';
import styles from './Plans.module.css';
import segmentTrack from '../../helpers/segment/segmentTrack';

const Plans = () => {
  return (
    <div className={styles.pricing} id="pricing">
      <h3>Pricing</h3>
      <div className={styles.plans}>
        <div className={styles.plan}>
          <div className={styles.main}>
            <h4>Starter</h4>
            <div className={styles.price}>
              <span>$0</span> USD/mo.
            </div>
            <div className={styles.payment}>billed annually</div>
            <Button
              className={styles.planButton}
              onClick={() => {
                segmentTrack('click_get_started', {
                  plan: 'Starter',
                });
                signIn('google', {
                  callbackUrl: '/dashboard',
                });
              }}
            >
              Get Started
            </Button>
          </div>
          <div className={styles.bullets}>
            <p>
              <Check width={12} /> Up to 10k MTU
            </p>
            <p>
              <Check width={12} /> Basic support
            </p>
          </div>
        </div>
        <div className={`${styles.plan} ${styles.growth}`}>
          <div className={styles.main}>
            <h4>Growth</h4>
            <div className={styles.price}>
              <span>$69</span> USD/mo.
            </div>
            <div className={styles.payment}>billed annually</div>
            <Button
              className={styles.planButton}
              color="primary"
              onClick={() => {
                segmentTrack('click_get_started', {
                  plan: 'Growth',
                });
                signIn('google', {
                  callbackUrl: '/dashboard',
                });
              }}
            >
              Get Started
            </Button>
          </div>
          <div className={styles.bullets}>
            <p>
              <Check width={12} /> Up to 50k MTU
            </p>
            <p>
              <Check width={12} /> Priority support
            </p>
          </div>
        </div>
        <div className={styles.plan}>
          <div className={styles.main}>
            <h4>Enterprise</h4>
            <div className={styles.price}>
              <span>$129</span> USD/mo.
            </div>
            <div className={styles.payment}>billed annually</div>
            <Button
              className={styles.planButton}
              onClick={() => {
                segmentTrack('click_get_started', {
                  plan: 'Enterprise',
                });
                signIn('google', {
                  callbackUrl: '/dashboard',
                });
              }}
            >
              Get Started
            </Button>
          </div>
          <div className={styles.bullets}>
            <p>
              <Check width={12} /> Up to 100k MTU
              <br />
              <div className={styles.then}>Then +$129 per 100k MTU</div>
            </p>
            <p>
              <Check width={12} /> Priority support
            </p>
          </div>
        </div>
      </div>
      <div className={styles.bigger}>
        *MTU means Monthly Tracked Users. This is an internal count of total
        unique visitors that enter your site.
      </div>
    </div>
  );
};

export default Plans;
