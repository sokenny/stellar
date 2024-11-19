'use client';

import React, { useEffect } from 'react';
import useStore from '../../store';
import { Progress } from '@nextui-org/react';
import calculateSignificance from '../../helpers/calculateSignificance';
import styles from './StatisticalSignificance.module.css';
export default function StatisticalSignificance({ experiment }) {
  const { stats, getExperimentStats } = useStore();
  useEffect(() => {
    getExperimentStats(experiment.id, 'unique-visitors');
  }, [experiment.id]);

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

  const variantWithHighestConversionRate = experiment.variants.reduce(
    (max, variant) => {
      const variantStats = uvStats.find(
        (stat) => stat.variantId === variant.id,
      );
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
    const baseMessage = `The observed difference in conversion rate from baseline is <span>${conversionRateDifference.toFixed(
      2,
    )}%</span>. There is a <span>${significance.toFixed(
      2,
    )}%</span> chance <span>${
      dataOfVariantWithHighestConversionRate?.name
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
      <p
        className={styles.confidenceMessage}
        dangerouslySetInnerHTML={{ __html: getConfidenceMessage() }}
      ></p>
    </div>
  );
}
