'use client';

import React from 'react';
import useStore from '../../store';
import { Progress } from '@nextui-org/react';
import calculateSignificance from '../../helpers/calculateSignificance';
import styles from './StatisticalSignificance.module.css';
export default function StatisticalSignificance({ experiment }) {
  const { stats } = useStore();

  if (!stats) return null;

  const uvStats = stats[experiment.id + '-unique-visitors'];

  if (!uvStats) return null;

  const controlVStats = uvStats.find(
    (stat) =>
      stat.variantId === experiment.variants.find((v) => v.is_control).id,
  );
  const otherVariants = uvStats
    .filter((stat) => stat.variantId !== controlVStats.variantId)
    .map((stat) => {
      return uvStats.find((s) => s.variantId === stat.variantId);
    });
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

  let confidenceMessage;

  if (significance >= 95) {
    confidenceMessage = `The observed difference in conversion rate is ${conversionRateDifference.toFixed(
      2,
    )}%, which is statistically significant given then volume of data collected.`;
  } else if (significance >= 80) {
    confidenceMessage = `The observed difference in conversion rate is ${conversionRateDifference.toFixed(
      2,
    )}%, suggesting potential significance. Consider collecting more data.`;
  } else {
    confidenceMessage = `The observed difference in conversion rate is ${conversionRateDifference.toFixed(
      2,
    )}%, which isn't statistically significant given then volume of data collected. More data may be needed.`;
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
        label="Statistical Significance"
        value={significance}
        showValueLabel={true}
      />
      <p className={styles.confidenceMessage}>{confidenceMessage}</p>
    </div>
  );
}
