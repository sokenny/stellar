'use client';

import { Button, Switch, Chip } from '@nextui-org/react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Check from '../../icons/Check';
import styles from './Plans.module.css';
import segmentTrack from '../../helpers/segment/segmentTrack';
import { useState } from 'react';

const Plans = () => {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(true);

  const prices = {
    growth: {
      annual: 69,
      monthly: 104,
    },
    enterprise: {
      annual: 129,
      monthly: 194,
    },
  };

  return (
    <div className={styles.pricing} id="pricing">
      <h3>Pricing</h3>
      <div className={styles.billingToggle}>
        <Switch
          defaultSelected={isAnnual}
          onValueChange={setIsAnnual}
          classNames={{
            wrapper: styles.switchWrapper,
          }}
        >
          Bill annually (save 33%)
        </Switch>
      </div>
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
              onClick={() => router.push('/signup')}
            >
              Get Started
            </Button>
          </div>
          <div className={styles.bullets}>
            <p>
              <Check width={12} /> Up to 25k MTU
            </p>
            <p>
              <Check width={12} /> Basic support
            </p>
          </div>
        </div>
        <div className={`${styles.plan} ${styles.growth}`}>
          <div className={styles.chipContainer} id="growth-chip">
            <Chip color="primary" variant="flat" size="sm">
              1 month free trial
            </Chip>
          </div>
          <div className={styles.main}>
            <h4>Growth</h4>
            <div className={styles.price}>
              <span>
                ${isAnnual ? prices.growth.annual : prices.growth.monthly}
              </span>{' '}
              USD/mo.
            </div>
            <div className={styles.payment}>
              billed {isAnnual ? 'annually' : 'monthly'}
            </div>
            <Button
              className={styles.planButton}
              color="primary"
              onClick={() => router.push('/signup')}
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
        <div className={`${styles.plan} ${styles.enterprise}`}>
          <div className={styles.chipContainer} id="enterprise-chip">
            <Chip color="primary" variant="flat" size="sm">
              1 month free trial
            </Chip>
          </div>
          <div className={styles.main}>
            <h4>Enterprise</h4>
            <div className={styles.price}>
              <span>
                $
                {isAnnual
                  ? prices.enterprise.annual
                  : prices.enterprise.monthly}
              </span>{' '}
              USD/mo.
            </div>
            <div className={styles.payment}>
              billed {isAnnual ? 'annually' : 'monthly'}
            </div>
            <Button
              className={styles.planButton}
              onClick={() => router.push('/signup')}
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
        *MTU: Monthly Tracked Users. This is an internal count we keep of the
        total unique visitors that enter your site.
      </div>
    </div>
  );
};

export default Plans;
