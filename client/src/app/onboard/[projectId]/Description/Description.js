'use client';

import { useState } from 'react';
import { Tooltip } from '@nextui-org/react';
import styles from './Description.module.css';

const Description = () => {
  const [isConversionTooltipOpen, setIsConversionTooltipOpen] = useState(false);
  return (
    <div className={styles.Description}>
      <p>Here are some experiments generated from your main text elements.</p>
      <p>
        We estimate a potential{' '}
        <Tooltip
          isOpen={isConversionTooltipOpen}
          showArrow
          onOpenChange={(open) => setIsConversionTooltipOpen(open)}
          content="This estimate is based on what we consider as a 'conversion', which in this case, refers to clicks on the main CTA on the page."
          className={styles.conversionTooltip}
          closeDelay={0}
          disableAnimation
        >
          <span>34% increase in your page conversion rate</span>
        </Tooltip>{' '}
        solely from copy tweaks in these main elements.
      </p>
      <p>
        You can create more sophisticated variants with different styles inside
        our visual builder once your account has been setup.
      </p>
      <p>
        Feel free to proceed with current settings and modify them later on.
      </p>
    </div>
  );
};

export default Description;
