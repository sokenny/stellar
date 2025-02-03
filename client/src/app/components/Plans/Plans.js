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
  const [selectedMTU, setSelectedMTU] = useState(30); // Default 30k MTU

  const calculatePrice = (mtu) => {
    const basePrice = 100;
    let totalPrice = basePrice;

    if (mtu > 200) {
      // Price for 30k-100k
      totalPrice += ((100 - 30) / 10) * 35;
      // Price for 100k-200k
      totalPrice += ((200 - 100) / 25) * 50;
      // Price for remaining MTU above 200k
      totalPrice += Math.floor((mtu - 200) / 50) * 85;
    } else if (mtu > 100) {
      // Price for 30k-100k
      totalPrice += ((100 - 30) / 10) * 35;
      // Price for remaining MTU above 100k
      totalPrice += Math.floor((mtu - 100) / 25) * 50;
    } else {
      // Price for MTU between 30k and 100k
      totalPrice += Math.floor((mtu - 30) / 10) * 35;
    }

    return Math.round(totalPrice);
  };

  const handleMTUChange = (e) => {
    let value = parseInt(e.target.value);

    // Adjust the value based on ranges
    if (value > 200) {
      // Round to nearest 50k
      value = Math.round(value / 50) * 50;
    } else if (value > 100) {
      // Round to nearest 25k
      value = Math.round(value / 25) * 25;
    } else {
      // Round to nearest 10k
      value = Math.round(value / 10) * 10;
    }

    setSelectedMTU(value);
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
        {/* Free Plan */}
        <div className={styles.plan}>
          <div className={styles.main}>
            <h4>Free</h4>
            <div className={styles.price}>
              <span>$0</span> USD/mo.
            </div>
          </div>
          <div className={styles.bullets}>
            <p>
              <Check width={12} /> Up to 25k MTU
            </p>
            <p>
              <Check width={12} /> Basic support
            </p>
            {/* Add more features as needed */}
          </div>
          <Button
            className={styles.planButton}
            onClick={() => router.push('/signup')}
          >
            Get Started
          </Button>
        </div>

        {/* Growth Plan */}
        <div className={`${styles.plan} ${styles.growth}`}>
          <div className={styles.chipContainer}>
            <Chip color="primary" variant="flat" size="sm">
              1 month free trial
            </Chip>
          </div>
          <div className={styles.main}>
            <h4>Growth</h4>
            <div className={styles.price}>
              <span>
                $
                {Math.round(
                  isAnnual
                    ? calculatePrice(selectedMTU) * 0.67
                    : calculatePrice(selectedMTU),
                )}
              </span>{' '}
              USD/mo.
            </div>
            <div className={styles.payment}>
              billed {isAnnual ? 'annually' : 'monthly'}
            </div>
            <div className={styles.mtuSlider}>
              <input
                type="range"
                min="30"
                max="300"
                step="1"
                value={selectedMTU}
                onChange={handleMTUChange}
              />
              <div>{selectedMTU}k MTU</div>
            </div>
          </div>
          <div className={styles.bullets}>
            <p>
              <Check width={12} /> Everything in Free
            </p>
            <p>
              <Check width={12} /> Priority support
            </p>
            {/* Add more features as needed */}
          </div>
          <Button
            className={styles.planButton}
            color="primary"
            onClick={() => router.push('/signup')}
          >
            Get Started
          </Button>
        </div>

        {/* Scale Plan */}
        <div className={`${styles.plan} ${styles.scale}`}>
          <div className={styles.main}>
            <h4>Scale</h4>
            <div className={styles.customPrice}>
              Custom
              <div className={styles.subtitle}>
                A plan tailored to your needs
              </div>
            </div>
          </div>
          <div className={styles.bullets}>
            <p>
              <Check width={12} /> 300k+ MTU
            </p>
            <p>
              <Check width={12} /> Everything in Growth
            </p>
            <p>
              <Check width={12} /> Premium support
            </p>
          </div>
          <Button
            className={styles.planButton}
            onClick={() => router.push('/signup')}
          >
            Get Started
          </Button>
        </div>
      </div>

      <div className={styles.bigger}>
        *MTU: Monthly Tracked Users. This is an internal count we keep of the
        total unique visitors that participate in your experiments.
      </div>
    </div>
  );
};

export default Plans;
