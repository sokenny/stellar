'use client';

import React, { useEffect } from 'react';
import useStore from '../../store';
import { Progress, Tooltip } from '@nextui-org/react';
import calculateSignificance from '../../helpers/calculateSignificance';
import Info from '../../icons/Info/Info';
import styles from './StatisticalSignificance.module.css';

export default function StatisticalSignificance({ experiment }) {
  const { stats, getExperimentStats } = useStore();
  useEffect(() => {
    getExperimentStats(experiment.id, 'unique-visitors');
  }, [experiment.id]);

  if (!stats) return null;

  const uvStats = stats[experiment.id + '-unique-visitors'];
  if (!uvStats || uvStats.length === 0) return null;

  const controlVStats = uvStats.find(
    (stat) =>
      stat.variantId === experiment.variants.find((v) => v.is_control).id,
  );
  if (!controlVStats) return null;

  const otherVariants = uvStats
    .filter((stat) => stat.variantId !== controlVStats.variantId)
    .map((stat) => {
      return uvStats.find((s) => s.variantId === stat.variantId);
    });

  if (!otherVariants.length) return null;

  const highestCRVStats = otherVariants.reduce(
    (max, v) => (v.conversionRate > max.conversionRate ? v : max),
    otherVariants[0],
  );

  const varsForStatSig = [controlVStats.variantId, highestCRVStats.variantId];
  const statsForCalculation = uvStats.filter((stat) =>
    varsForStatSig.includes(stat.variantId),
  );
  const statsForCalculationWithControlFlag = statsForCalculation.map(
    (stat) => ({
      ...stat,
      isControl: stat.variantId === controlVStats.variantId,
    }),
  );

  const significance = calculateSignificance(
    statsForCalculationWithControlFlag,
  );

  const controlConversionRate = uvStats.find(
    (stat) => stat.variantId === controlVStats.variantId,
  ).conversionRate;
  const highestConversionRate = uvStats.find(
    (stat) => stat.variantId === highestCRVStats.variantId,
  ).conversionRate;
  const conversionRateDifference =
    ((highestConversionRate - controlConversionRate) / controlConversionRate) *
    100;

  const variantWithHighestConversionRate = experiment.variants.reduce(
    (max, variant) => {
      const variantStats = uvStats.find(
        (stat) => stat.variantId === variant.id,
      );
      if (!variantStats) return max;
      return variantStats.conversionRate > max.conversionRate
        ? variantStats
        : max;
    },
    { conversionRate: -Infinity },
  );

  const dataOfVariantWithHighestConversionRate = experiment.variants.find(
    (variant) => variant.id === variantWithHighestConversionRate.variantId,
  );

  function getConfidenceMessage() {
    if (
      !controlConversionRate ||
      !highestConversionRate ||
      isNaN(significance)
    ) {
      return 'Not enough data has been collected yet to calculate statistical significance.';
    }

    const baseMessage = `The observed difference in conversion rate from baseline is <span>${
      isNaN(conversionRateDifference)
        ? '0'
        : conversionRateDifference.toFixed(2)
    }%</span>. There is a <span>${
      isNaN(significance) ? '0' : significance.toFixed(2)
    }%</span> chance <span>${
      dataOfVariantWithHighestConversionRate?.name || 'a variant'
    }</span> is the winner of this experiment.`;

    // Determine additional context based on significance
    if (significance >= 95) {
      return `${baseMessage} This result is statistically significant given the volume of data collected.`;
    } else if (significance >= 80) {
      return `${baseMessage} The result suggests potential significance, but more data may be needed to confirm.`;
    } else {
      return `${baseMessage} This result isn't statistically significant yet. More data may be needed.`;
    }
  }

  if (isNaN(significance)) {
    return null;
  }

  return (
    <div>
      <Progress
        size="md"
        radius="sm"
        classNames={{
          track: 'drop-shadow-md border border-default',
          indicator: 'bg-gradient-to-r from-[#cb5edc] to-[#0072f5]',
          label: 'tracking-wider font-medium text-default-600',
          value: 'text-foreground/60',
        }}
        label={
          <div className="flex items-center gap-1">
            <span>Statistical Significance</span>
            <Tooltip
              content={
                <div className={styles.tooltipContent}>
                  Statistical significance is calculated using{' '}
                  <span>p-value</span>, which measures how likely the observed
                  differences between variants occurred by chance. A higher
                  percentage indicates stronger evidence that the results are
                  not random."
                </div>
              }
              showArrow
              closeDelay={200}
              className={styles.tooltip}
            >
              <div>
                <Info />
              </div>
            </Tooltip>
          </div>
        }
        value={significance}
        showValueLabel={true}
      />
      <p
        className={styles.confidenceMessage}
        dangerouslySetInnerHTML={{ __html: getConfidenceMessage() }}
      ></p>
    </div>
  );
}
