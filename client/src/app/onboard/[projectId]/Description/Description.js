'use client';

import { useState } from 'react';
import { Tooltip } from '@nextui-org/react';
import styles from './Description.module.css';

const Description = () => {
  const [isConversionTooltipOpen, setIsConversionTooltipOpen] = useState(false);
  return (
    <div className={styles.Description}>
      <p>
        Here are some experiments generated from your main text elements. We
        estimate a potential{' '}
        <Tooltip
          isOpen={isConversionTooltipOpen}
          showArrow
          onOpenChange={(open) => setIsConversionTooltipOpen(open)}
          content="This estimate is based on what we consider as a 'conversion', which in this case, refers to clicks on the main CTA on the page."
          className={styles.conversionTooltip}
          closeDelay={0}
        >
          <span>34% increase in your page conversion rate</span>
        </Tooltip>{' '}
        solely from copy tweaks in these main elements.
      </p>
      <p>
        You can further edit these variants after creating an account at the end
        of this step.
      </p>
    </div>
  );
};

export default Description;
