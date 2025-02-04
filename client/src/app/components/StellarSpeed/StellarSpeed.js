'use client';

import { useState, useEffect, useRef } from 'react';
import { Progress } from '@nextui-org/react';
import styles from './StellarSpeed.module.css';

export default function StellarSpeed({ className }) {
  const [progressValues, setProgressValues] = useState({
    stellar: 0,
    vwo: 100,
    optimize: 150,
    ablyft: 180,
    convert: 200,
  });

  const containerRef = useRef(null);

  useEffect(() => {
    const targetValues = {
      stellar: 13,
      vwo: 253,
      optimize: 343,
      ablyft: 658,
      convert: 758,
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const interval = setInterval(() => {
            setProgressValues((prevValues) => {
              const newValues = { ...prevValues };
              let allComplete = true;

              for (const key in targetValues) {
                if (newValues[key] < targetValues[key]) {
                  newValues[key] += 4;
                  allComplete = false;
                }
              }

              if (allComplete) {
                clearInterval(interval);
              }

              return newValues;
            });
          }, 2);

          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.chartContainer}>
        <div ref={containerRef} className={`flex flex-col gap-6 w-full`}>
          <Progress
            color="#cb5edc"
            label={`Stellar (${progressValues.stellar}ms)`}
            value={progressValues.stellar}
            maxValue={758}
            className="w-full"
          />
          <Progress
            color="warning"
            label={`VWO (${progressValues.vwo}ms)`}
            value={progressValues.vwo}
            maxValue={758}
            className="w-full"
          />
          <Progress
            color="warning"
            label={`Optimizely (${progressValues.optimize}ms)`}
            value={progressValues.optimize}
            maxValue={758}
            className="w-full"
          />
          <Progress
            color="danger"
            label={`ABlyft (${progressValues.ablyft}ms)`}
            value={progressValues.ablyft}
            maxValue={758}
            className="w-full"
          />
          <Progress
            color="danger"
            label={`Convert (${progressValues.convert}ms)`}
            value={progressValues.convert}
            maxValue={758}
            className="w-full"
          />
        </div>
        <div className={styles.legend}>
          Performance impact on LCP in milliseconds
        </div>
      </div>
      <div className={styles.texts}>
        <p>
          Stellar’s script is ultra-lightweight at just 5.4KB, making it up to
          25x smaller than competitors like VWO or AB Tasty. Built with pure
          JavaScript and decluttered from unnecessary dependencies, it ensures
          minimal impact on your website’s speed and Core Web Vitals. Unlike
          other tools that grow heavier with each test, Stellar’s fixed-size
          script keeps your site fast, responsive, and optimized for both user
          experience and SEO—no matter how many experiments you run.
        </p>
      </div>
    </div>
  );
}
